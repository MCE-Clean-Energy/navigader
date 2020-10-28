import { Interval } from 'luxon';

import {
  BasicIntervalData,
  BasicIntervalDatum,
  DateTuple,
  Frame288Numeric,
  IntervalDataArray,
  IntervalDataFilters,
  IntervalData as IntervalDataInterface,
  IntervalDatum,
  isTruthy,
  Maybe,
  MonthIndex,
  NumberTuple,
  RawIntervalData,
} from 'navigader/types';
import _ from '../lodash';
import { parseDate } from '../serializers';

/** ============================ Types ===================================== */
type DatumAlignment = Array<{ datum: IntervalDatum; interval: IntervalData }>;
type IntervalDataObject<K extends string, V extends string> = Record<K, string[]> &
  Record<V, number[]> & { name: string };

/** ============================ Interval ================================== */
/**
 * This class wraps an interval datum, dynamically calculating the `timestamp` when requested. This
 * date parsing is a relatively expensive operation, so we do so sparingly/conservatively/lazily.
 */
class IntervalDatumWrapper implements IntervalDatum {
  readonly timestring: string;
  readonly value: number;

  private _timestamp: Maybe<Date>;

  constructor(datum: BasicIntervalDatum) {
    this.timestring = datum.timestring;
    this.value = datum.value;

    // When a property is defined as non-enumerable, its key-value pair will not turn up in
    // `for..of` loops or in calls to `Object.keys`. In our case this is convenient for making
    // test assertions. Say we have two `IntervalData` instances:
    //
    //   ```
    //   const intervalA = new IntervalData(data, name);
    //   const intervalB = new IntervalData(data, name);
    //   ```
    //
    //  In a jest assertion, they will be equivalent:
    //
    //   ```
    //   expect(intervalA).toMatchObject(intervalB); --> true
    //   ```
    //
    // However, if we access the `period` field of one interval but not that of the other, our
    // assertion fails:
    //
    //   ```
    //   const period = intervalA.period;
    //   expect(intervalA).toMatchObject(intervalB); --> false
    //   ```
    //
    // This is because jest iterates across all enumerable fields of the object passed to the
    // `toMatchObject` matcher function, recursively comparing the values between the expected and
    // received object. When it compares the `_timestamp` fields of the first and second data of
    // both intervals, it will find that `_timestamp` in `intervalA` is a Date object, while the
    // same field in `intervalB` is undefined. This is expected, as `intervalB`'s period has not
    // been accessed and so its timestamps have not been computed. However, this shouldn't
    // constitute a basis for failing the test, and hence `_timestamp` is non-enumerable.
    Object.defineProperty(this, '_timestamp', { enumerable: false });
  }

  /**
   * Wraps a `BasicIntervalDatum` if provided, or returns an `IntervalDatumWrapper` unchanged, so as
   * not to double-wrap.
   *
   * @param {BasicIntervalDatum|IntervalDatumWrapper} d: the datum to wrap/return
   */
  static wrap(d: BasicIntervalDatum | IntervalDatumWrapper) {
    return d instanceof IntervalDatumWrapper ? d : new IntervalDatumWrapper(d);
  }

  /**
   * Actually parses the interval timestring.
   */
  get timestamp() {
    if (!this._timestamp) {
      this._timestamp = parseDate(this.timestring);
    }

    return this._timestamp;
  }

  /**
   * Returns a new `IntervalDatumWrapper` with the same timestamp as this one, optionally with a new
   * value
   *
   * @param {number} [value]: the new value to assign to the cloned wrapper
   */
  clone(value?: number): IntervalDatum {
    const newWrapper = new IntervalDatumWrapper({
      timestring: this.timestring,
      value: value ?? this.value,
    });

    // If the timestamp has already been computed, pass it along to the clone
    if (this._timestamp) {
      newWrapper._timestamp = this._timestamp;
    }

    return newWrapper;
  }
}

export class IntervalData implements IntervalDataInterface {
  readonly data: IntervalDataArray;
  name: string;

  // Memoized fields
  private _period: number | undefined;

  /** ========================== Setup and teardown ======================== */
  constructor(data: BasicIntervalData, name: string) {
    this.data = data.map((d) => IntervalDatumWrapper.wrap(d));
    this.name = name;
  }

  /**
   * Serializes the interval back into its raw form, typically for saving to the store
   *
   * @param {string} unit: a key under which the `value` fields will be saved
   * @param {string} column: a key under which the `timestamp` fields will be saved
   */
  serialize<Unit extends string, Column extends string>(unit: Unit, column: Column) {
    return {
      [column]: _.map(this.data, 'timestring'),
      [unit]: _.map(this.data, 'value'),
    } as RawIntervalData<Unit, Column>;
  }

  /** ========================== Getters =================================== */
  /**
   * Returns the dataset's domain, both in the time dimension and value dimension
   */
  get domain() {
    return {
      timestamp: this.timeDomain,
      value: this.valueDomain,
    };
  }

  /**
   * Returns the period of the interval data
   */
  get period() {
    if (this._period !== undefined) return this._period;

    return Interval.fromDateTimes(this.data[0].timestamp, this.data[1].timestamp).length('minutes');
  }

  /**
   * Returns the dataset's time domain. This assumes the data is already ordered
   */
  get timeDomain(): DateTuple {
    return [this.data[0].timestamp, this.data[this.data.length - 1].timestamp];
  }

  /**
   * Returns the dataset's value domain
   */
  get valueDomain(): NumberTuple {
    const values = this.values;
    return [Math.min(...values), Math.max(...values)];
  }

  /**
   * Returns an ordered array of the dataset's values
   */
  get values() {
    return _.map(this.data, 'value');
  }

  /**
   * Returns an array of the years the interval spans
   */
  get years() {
    const [start, end] = this.timeDomain;
    return _.range(start.getFullYear(), end.getFullYear() + 1);
  }

  get chartData() {
    return this.data.map((datum) => ({
      name: this.name,
      timestamp: datum.timestamp,
      value: datum.value,
    }));
  }

  /** ========================== Accessors ================================= */
  /**
   * Returns the first timestamp that occurs in the given month
   *
   * @param {MonthIndex} month: number representing the month to retrieve the first timestamp of
   */
  startOfMonth(month: MonthIndex) {
    const firstTimestampInMonth = _.find(
      this.data,
      (datum) => datum.timestamp.getMonth() + 1 === month
    );

    return firstTimestampInMonth?.timestamp;
  }

  /** ========================== Mutators ================================== */
  rename(name?: string) {
    if (name) this.name = name;
    return this;
  }

  /** ========================== Iteration methods ========================= */
  /**
   * Filters the interval data to a subset which passes the given filters. If no filters are
   * provided, the `IntervalData` is returned unchanged. Several different types of filters
   * can be used:
   *
   *   [MonthIndex] month: the 1-indexed month of the year to filter down to
   *   [Date] start: date before which data will be filtered out
   *   [Date] end: date after which data will be filtered out
   *   [[Date, Date]] range: shorthand for start and end
   *
   * @param {IntervalDataFilters} filters: the filters to apply to the dataset
   */
  filter(filters?: IntervalDataFilters) {
    if (!filters) return this;
    const { month, range } = filters;

    // Set start and end, using the range if provided
    let { start, end } = filters;
    if (range) [start, end] = range;

    // Only data that pass all filter functions will be returned
    const filterFns: Array<(datum: IntervalDatum) => boolean> = [];

    if (month) {
      filterFns.push((datum) => datum.timestamp.getMonth() + 1 === month);
    }

    if (start) {
      // We need a lexically-scoped reference to `start` in order for the narrowed type to persist
      // within the closure
      const lexicallyScopedStart = start;
      filterFns.push((datum) => lexicallyScopedStart <= datum.timestamp);
    }

    if (end) {
      const lexicallyScopedEnd = end;
      filterFns.push((datum) => lexicallyScopedEnd >= datum.timestamp);
    }

    return new IntervalData(
      this.data.filter((datum) => _.every(filterFns.map((fn) => fn(datum)))),
      this.name
    );
  }

  /**
   * Creates a new `IntervalData` by calling a function on every datum within the series. The
   * timestamps will not be changed.
   *
   * @param {function} fn: the function to call for every datum
   */
  map(fn: (datum: IntervalDatum) => number) {
    return this.transform(this.data.map((datum) => datum.clone(fn(datum))));
  }

  /** ========================== Transformations =========================== */
  /**
   * Aligns one interval dataset with others according to their timestamps. Returns an array of
   * `IntervalDatum` arrays, each subarray a set of data that are aligned
   *
   * @param others
   */
  private align(...others: IntervalData[]): DatumAlignment[] {
    const clonedData = [...this.data];
    const alignments = [];

    for (let alignment of alignmentIter()) {
      alignments.push(
        alignment.map(([datum, i]) => ({
          datum,
          interval: i === 0 ? this : others[i - 1],
        }))
      );
    }

    return alignments;

    /**
     * Generator yielding intervals aligned by their timestamps
     */
    function* alignmentIter() {
      const otherClones = others.map((other) => [...other.data]);
      const clones = [clonedData, ...otherClones];

      // While any of the data arrays have any data left in them...
      while (_.some(clones.map((arr) => arr.length !== 0))) {
        let earliest = {
          time: Infinity,
          data: [] as Array<[IntervalDatum, number]>,
        };

        // Find the earliest data
        clones.forEach((clone, i) => {
          if (clone.length === 0) return;
          const firstDatum = clone[0];
          if (+firstDatum.timestamp < earliest.time) {
            earliest = { time: +firstDatum.timestamp, data: [[firstDatum, i]] };
          } else if (+firstDatum.timestamp === earliest.time) {
            earliest.data.push([firstDatum, i]);
          }
        });

        yield earliest.data;

        // Clear the earliest data from their respective intervals
        earliest.data.forEach(([, i]) => clones[i].splice(0, 1));
      }
    }
  }

  /**
   * Scales the interval data by dividing values by a constant
   *
   * @param {number} n: the number to divide the interval values by
   */
  divide(n: number) {
    return this.map((datum) => datum.value / n);
  }

  /**
   * Scales the interval data by multiplying values by a constant
   *
   * @param {number} multiplier: the number to multiply the interval values by
   */
  multiply(multiplier: number | IntervalData) {
    if (typeof multiplier === 'number') {
      return this.map((datum) => datum.value * multiplier);
    }

    return this.transform(
      this.align(multiplier).map((alignment) =>
        alignment[0].datum.clone(alignment.reduce((n, { datum }) => n * datum.value, 1))
      )
    );
  }

  /**
   * Subtracts one interval dataset from another after aligning them.
   *
   * @param {IntervalData} other: the other interval dataset which will be subtracted
   */
  subtract(other: IntervalData) {
    return this.transform(
      this.align(other)
        .map((alignment) => {
          if (alignment.length < 2) return null;

          // Subtract the aligned value from this value
          const [thisDatum, otherDatum] = _.map(alignment, 'datum');
          return thisDatum.clone(thisDatum.value - otherDatum.value);
        })
        .filter(isTruthy)
    );
  }

  /**
   * Returns a new `IntervalData` object with the provided data, conferring the name of the current
   * `IntervalData` object to the new one.
   *
   * @param {IntervalData} data: the data array to provide to the new `IntervalData` object
   */
  transform(data: IntervalDataArray) {
    return new IntervalData(data, this.name);
  }

  /** ========================== 288 methods ============================ */
  /**
   * Produces an `IntervalData` with the same domain, with values taken from a provided
   * `Frame288Numeric`
   *
   * @param {Frame288Numeric} frame: the frame to take values from
   */
  align288(frame: Frame288Numeric) {
    return this.map288(frame, (datum, value288) => value288).rename(frame.name);
  }

  /**
   * Creates a new `IntervalData` by calling a function on every datum within the series. The
   * function will be called with the interval datum and the 288 value corresponding with the
   * datum's date
   *
   * @param {Frame288Numeric} frame: the frame 288 to map with
   * @param {function} fn: the function to call for each datum/288 cell. The value returned from
   *   this will become the new `IntervalData`'s value at the corresponding timestamp.
   */
  map288(frame: Frame288Numeric, fn: (datum: IntervalDatum, n: number) => number) {
    return this.map((datum) => fn(datum, frame.getValueByDate(datum.timestamp)));
  }

  /**
   * Transforms the interval data by multiplying each datum by the timestamp's corresponding value
   * in the provided 288. The timestamp will be used to determine each datum's month and hour, and
   * then those values will be used to index the 288
   *
   * @param {Frame288Numeric} frame: the frame to multiply the interval data by
   */
  multiply288(frame: Frame288Numeric) {
    return this.map288(frame, (datum, value288) => datum.value * value288);
  }
}

/** ============================ Helpers =================================== */
/**
 * Creates an `IntervalData` object given an object of the form:
 *
 *   {
 *     [timeKey]: timestamp[]
 *     [valueKey]: number[]
 *     name: string
 *   }
 *
 * The `timeKey` and `valueKey` keys can be any string, and must be provided as parameters
 *
 * @param {IntervalDataObject} object: the object of the form given above
 * @param {string} timeKey: the key under which the timestamps are provided
 * @param {string} valueKey: the key under which the interval data are provided
 */
export function makeIntervalData<TimeKey extends string, ValueKey extends string>(
  object: IntervalDataObject<TimeKey, ValueKey>,
  timeKey: TimeKey,
  valueKey: ValueKey
) {
  const timestamps = object[timeKey];
  const values = object[valueKey];
  return new IntervalData(
    _.range(timestamps.length).map((index) => ({
      timestring: timestamps[index],
      value: values[index],
    })),
    object.name
  );
}
