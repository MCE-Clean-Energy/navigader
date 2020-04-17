import every from 'lodash/every';
import flatten from 'lodash/flatten';
import isArray from 'lodash/isArray';
import range from 'lodash/range';

import { MonthIndex } from '@nav/shared/types';
import { typeGuards } from '@nav/shared/util';
import { Frame288NumericType, LoadType, LoadTypeMap, MeterDataField, MeterGroup } from './types';


/**
 * A type guard for checking that the meter has a particular data field or fields.
 *
 * @param {MeterDataField} data - The meter's data object
 * @param {LoadType | LoadType[]} loadType - The load type(s) to check for in the meter data
 */
export function hasDataField <T extends LoadType>(
  data: MeterDataField,
  loadType: T | T[]
): data is Pick<LoadTypeMap, T> {
  return isArray(loadType)
    ? every(loadType, t => data.hasOwnProperty(t))
    : data.hasOwnProperty(loadType);
}

/**
 * Basic parsing function for meter groups
 *
 * @param {MeterGroup} meterGroup - The raw meter group object obtained from the back-end
 */
export function parseMeterGroup (meterGroup: MeterGroup): MeterGroup {
  if (meterGroup.object_type === 'CustomerCluster') return meterGroup;
  return {
    ...meterGroup,
    metadata: {
      ...meterGroup.metadata,
      filename: meterGroup.metadata.filename.replace(/origin_files\//, '')
    }
  };
}

/**
 * Returns a display name for the given meter group
 *
 * @param {MeterGroup} meterGroup: the meter group object to display. The overload that accepts
 *   undefined is there to enable usage in situations where the meter group is optional
 */
export function getMeterGroupDisplayName (meterGroup: any) {
  if (!typeGuards.isMeterGroup(meterGroup)) return '';
  switch (meterGroup.object_type) {
    case 'OriginFile':
      return meterGroup.name || meterGroup.metadata.filename;
    case 'CustomerCluster':
      // TODO: How do we represent a customer cluster without a name?
      return meterGroup.name || '';
  }
}

export class Frame288Numeric {
  static months = range(1, 13) as MonthIndex[];
  readonly flattened: number[];
  readonly frame: Frame288NumericType;

  constructor (frame: Frame288NumericType) {
    this.frame = frame;
    this.flattened = flatten(Frame288Numeric.months.map(i => this.frame[i]));
  }
  
  /**
   * Returns an array of the minimum and maximum values in the dataset
   */
  getRange () {
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
   * Returns a flat array of all values in the frame
   */
  flatten () {
    return this.flattened;
  }
}
