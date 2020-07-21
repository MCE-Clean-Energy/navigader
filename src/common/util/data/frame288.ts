import _ from 'navigader/util/lodash';
import {
  Frame288Numeric as Frame288NumericInterface,
  Frame288NumericType,
  Frame288Options,
  MonthIndex
} from 'navigader/types';


/** ============================ Types ===================================== */
type PowerUnit = 'kW' | 'MW' | 'GW';

/** ============================ Constants ================================= */
const months = _.range(1, 13) as MonthIndex[];

/** ============================ Wrappers ================================== */
export class Frame288Numeric implements Frame288NumericInterface {
  readonly flattened: number[];
  readonly frame: Frame288NumericType;
  units?: string;
  name?: string;
  
  constructor (frame: Frame288NumericType, options?: Frame288Options) {
    this.frame = frame;
    this.name = options?.name;
    this.units = options?.units;
    this.flattened = _.flatten(months.map(i => this.frame[i]));
  }
  
  /**
   * Returns an array of the minimum and maximum values in the dataset
   */
  getRange (): [number, number] {
    return [this.getMin(), this.getMax()];
  }
  
  /**
   * Computes the maximum value in the frame
   */
  getMax () {
    return Math.max(...this.flattened);
  }
  
  /**
   * Computes the minimum value in the frame
   */
  getMin () {
    return Math.min(...this.flattened);
  }
  
  /**
   * Accesses the frame's data for a given month
   *
   * @param {MonthIndex} month: the index of the month (integer between 1 and 12, inclusive)
   */
  getMonth (month: MonthIndex) {
    return this.frame[month];
  }
  
  /**
   * Returns the frame's value corresponding with a given month and hour
   *
   * @param {MonthIndex} month: the month to look up
   * @param {number} hour: the hour to look up
   */
  getValueByMonthHour (month: MonthIndex, hour: number) {
    return this.getMonth(month)[hour];
  }
  
  /**
   * Returns the frame's value corresponding with a Date object
   *
   * @param {Date} datetime: the date for which to look up the 288 value
   */
  getValueByDate (datetime: Date) {
    return this.getValueByMonthHour(datetime.getMonth() + 1 as MonthIndex, datetime.getHours());
  }
  
  /**
   * Creates a new `Frame288Numeric` by calling a function on every datum within the frame
   *
   * @param {function} fn: the function to call for every datum
   * @param {Frame288Options} [options]: the units and name of the frame
   */
  map (fn: (n: number) => number, options?: Frame288Options) {
    const mergedOptions = _.defaults({}, options, { name: this.name, units: this.units });
    return new Frame288Numeric(
      months.reduce((memo, monthIndex) => {
        memo[monthIndex] = this.frame[monthIndex].map(fn);
        return memo;
      }, {} as Frame288NumericType),
      mergedOptions
    );
  }
  
  /**
   * Returns a new frame with a different name
   *
   * @param {string} name: the new name of the frame
   */
  rename (name: string) {
    return new Frame288Numeric(this.frame, { name, units: this.units });
  }

  /**
   * Returns a flat array of all values in the frame
   */
  flatten () {
    return this.flattened;
  }
  
  /**
   * Multiplies every value in the frame by `n`
   *
   * @param {number} n: the value to multiply the frame by
   * @param {Frame288Options} [options]: the units and name of the frame
   */
  multiply (n: number, options?: Frame288Options) {
    return this.map(value => value * n, options);
  }
  
  /**
   * Divides every value in the frame by `n`
   *
   * @param {number} n: the value to divide the frame by
   * @param {Frame288Options} [options]: the units and name of the frame
   */
  divide (n: number, options?: Frame288Options) {
    return this.map(value => value / n, options);
  }
}

/**
 * Frame288 specific to power data
 */
export class PowerFrame288 extends Frame288Numeric {
  units: PowerUnit;
  
  constructor (frame: Frame288NumericType, options?: Frame288Options<PowerUnit>) {
    super(frame, options);
    this.units = options?.units || 'kW';
  }

  /**
   * Scales the data down an appropriate amount, such that
   */
  scale () {
    const [min, max] = this.getRange();
    const magnitude = Math.log10(Math.max(Math.abs(min), Math.abs(max)));
    const [divisor, units] = magnitude >= 6
      ? [1e6, 'GW']
      : magnitude >= 3
        ? [1e3, 'MW']
        : [1, 'kW'];
    
    return this.divide(divisor, { name: this.name, units });
  }
}
