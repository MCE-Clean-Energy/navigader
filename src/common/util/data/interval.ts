import moment from 'moment';

import _ from 'navigader/util/lodash';
import { isTruthy } from 'navigader/util/typeGuards';
import {
  DateTuple,
  Frame288Numeric,
  IntervalDataArray,
  IntervalDataFilters,
  IntervalData as IntervalDataInterface,
  IntervalDatum,
  MonthIndex,
  NumberTuple,
  RawIntervalData
} from 'navigader/types';


/** ============================ Types ===================================== */
type DatumAlignment = Array<{ datum: IntervalDatum, interval: IntervalData }>;
type IntervalDataObject<K extends string, V extends string>
  = Record<K, string[]> & Record<V, number[]> & { name: string; };

/** ============================ Interval ================================== */
export class IntervalData implements IntervalDataInterface {
  readonly data: IntervalDataArray;
  name: string;
  
  // Memoized fields
  private _period: number | undefined;
  
  constructor (data: IntervalDataArray, name: string) {
    this.data = data;
    this.name = name;
  }
  
  /**
   * Returns the period of the interval data
   */
  get period () {
    if (this._period !== undefined) return this._period;
    
    const time1 = moment(this.data[0].timestamp);
    const time2 = moment(this.data[1].timestamp);
    return moment.duration(time2.diff(time1)).asMinutes();
  }
  
  /**
   * Returns an array of the years the interval spans
   */
  get years () {
    const [start, end] = this.timeDomain();
    return _.range(start.getFullYear(), end.getFullYear() + 1);
  }
  
  /**
   * Serializes the interval back into its raw form, typically for saving to the store
   *
   * @param {string} unit: a key under which the `value` fields will be saved
   * @param {string} column: a key under which the `timestamp` fields will be saved
   */
  serialize <Unit extends string, Column extends string>(unit: Unit, column: Column) {
    return {
      [column]: this.data.map(datum => datum.timestamp.toString()),
      [unit]: _.map(this.data, 'value')
    } as RawIntervalData<Unit, Column>;
  }
  
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
  filter (filters?: IntervalDataFilters) {
    if (!filters) return this;
    const { month, range } = filters;
    
    // Set start and end, using the range if provided
    let { start, end } = filters;
    if (range) [start, end] = range;
    
    // Only data that pass all filter functions will be returned
    const filterFns: Array<(datum: IntervalDatum) => boolean> = [];
    
    if (month) {
      filterFns.push(datum => datum.timestamp.getMonth() + 1 === month);
    }
    
    if (start) {
      const intervalStart = moment(start);
      filterFns.push(datum => intervalStart.isSameOrBefore(datum.timestamp));
    }
    
    if (end) {
      const intervalEnd = moment(end);
      filterFns.push(datum => intervalEnd.isSameOrAfter(datum.timestamp));
    }
    
    return new IntervalData(
      this.data.filter(datum => _.every(filterFns.map(fn => fn(datum)))),
      this.name
    );
  }
  
  /**
   * Returns an ordered array of the dataset's values
   */
  values () {
    return _.map(this.data, 'value');
  }
  
  /**
   * Returns the dataset's domain, both in the time dimension and value dimension
   */
  domain () {
    return {
      timestamp: this.timeDomain(),
      value: this.valueDomain()
    };
  }
  
  /**
   * Returns the dataset's time domain. This assumes the data is already ordered
   */
  timeDomain (): DateTuple {
    return [
      this.data[0].timestamp,
      this.data[this.data.length - 1].timestamp
    ];
  }
  
  /**
   * Returns the first timestamp that occurs in the given month
   *
   * @param {MonthIndex} month: number representing the month to retrieve the first timestamp of
   */
  startOfMonth (month: MonthIndex) {
    const firstTimestampInMonth = _.find(
      this.data,
      datum => datum.timestamp.getMonth() + 1 === month
    );
    
    return firstTimestampInMonth?.timestamp;
  }
  
  /**
   * Returns the dataset's value domain
   */
  valueDomain (): NumberTuple {
    const values = this.values();
    return [Math.min(...values), Math.max(...values)];
  }
  
  /**
   * Aligns one interval dataset with others according to their timestamps. Returns an array of
   * `IntervalDatum` arrays, each subarray a set of data that are aligned
   *
   * @param others
   */
  private align (...others: IntervalData[]): DatumAlignment[] {
    const clonedData = [...this.data];
    const alignments = [];
    
    for (let alignment of alignmentIter()) {
      alignments.push(
        alignment.map(([datum, i]) => ({
          datum,
          interval: i === 0 ? this : others[i - 1]
        }))
      );
    }
    
    return alignments;
    
    /**
     * Generator yielding intervals aligned by their timestamps
     */
    function* alignmentIter () {
      const otherClones = others.map(other => [...other.data]);
      const clones = [clonedData, ...otherClones];
      
      // While any of the data arrays have any data left in them...
      while (_.some(clones.map(arr => arr.length !== 0))) {
        let earliest = {
          time: Infinity,
          data: [] as [IntervalDatum, number][]
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
   * Creates a new `IntervalData` by calling a function on every datum within the series. The
   * timestamps will not be changed.
   *
   * @param {function} fn: the function to call for every datum
   * @param {string} [name]: the name of the resulting `IntervalData`. Defaults to the
   *   current name of the interval
   */
  map (fn: (datum: IntervalDatum) => number, name: string = this.name) {
    return new IntervalData(
      this.data.map(datum => ({
        timestamp: datum.timestamp,
        value: fn(datum)
      })),
      name
    );
  }
  
  /** ============================ Transformations ============================ */
  /**
   * Subtracts one interval dataset from another after aligning them.
   *
   * @param {IntervalData} other: the other interval dataset which will be subtracted
   */
  subtract (other: IntervalData) {
    return new IntervalData(
        this.align(other).map((alignment) => {
          if (alignment.length < 2) return null;
          
          // Subtract the aligned value from this value
          const [thisDatum, otherDatum] = _.map(alignment, 'datum');
          return {
            timestamp: thisDatum.timestamp,
            value: thisDatum.value - otherDatum.value
          };
        }).filter(isTruthy),
      this.name
    );
  }
  
  /**
   * Scales the interval data by dividing values by a constant
   *
   * @param {number} n: the number to divide the interval values by
   */
  divide (n: number) {
    return this.map(datum => datum.value / n);
  }
  
  /**
   * Scales the interval data by multiplying values by a constant
   *
   * @param {number} multiplier: the number to multiply the interval values by
   * @param {string} [name]: the name of the resulting `IntervalData`
   */
  multiply (multiplier: number | IntervalData, name: string = this.name) {
    if (typeof multiplier === 'number') {
      return this.map(datum => datum.value * multiplier, name);
    }
    
    return new IntervalData(
      this.align(multiplier).map(alignment => ({
        timestamp: alignment[0].datum.timestamp,
        value: alignment.reduce((n, { datum }) => n * datum.value, 1)
      })),
      name
    );
  }
  
  /** ============================ 288 Operations ========================== */
  /**
   * Creates a new `IntervalData` by calling a function on every datum within the series. The
   * function will be called with the interval datum and the 288 value corresponding with the
   * datum's date
   *
   * @param {Frame288Numeric} frame: the frame 288 to map with
   * @param {function} fn: the function to call for each datum/288 cell. The value returned from
   *   this will become the new `IntervalData`'s value at the corresponding timestamp.
   * @param {string} [name]: the name of the resulting `IntervalData`
   */
  map288 (frame: Frame288Numeric, fn: (datum: IntervalDatum, n: number) => number, name?: string) {
    return this.map(datum => fn(datum, frame.getValueByDate(datum.timestamp)), name);
  }
  
  /**
   * Transforms the interval data by multiplying each datum by the timestamp's corresponding value
   * in the provided 288. The timestamp will be used to determine each datum's month and hour, and
   * then those values will be used to index the 288
   *
   * @param {Frame288Numeric} frame: the frame to multiply the interval data by
   * @param {string} [name]: the name of the resulting `IntervalData`
   */
  multiply288 (frame: Frame288Numeric, name?: string) {
    return this.map288(frame, (datum, value288) => datum.value * value288, name);
  }
  
  /**
   * Produces an `IntervalData` with the same domain, with values taken from a provided
   * `Frame288Numeric`
   *
   * @param {Frame288Numeric} frame: the frame to take values from
   */
  align288 (frame: Frame288Numeric) {
    return this.map288(frame, (datum, value288) => value288, frame.name);
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
export function makeIntervalData <K extends string, V extends string> (
  object: IntervalDataObject<K, V>,
  timeKey: K,
  valueKey: V
) {
  const timestamps = object[timeKey];
  const values = object[valueKey];
  return new IntervalData(
    _.range(timestamps.length).map(index => ({
      timestamp: new Date(timestamps[index]),
      value: values[index]
    })),
    object.name
  );
}
