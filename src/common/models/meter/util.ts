import { MonthIndex } from 'navigader/types';
import { _, math, typeGuards } from 'navigader/util';
import {
  Frame288NumericType, LoadType, LoadTypeMap, MeterDataField, MeterGroup, RawMeterGroup
} from './types';


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
  return _.isArray(loadType)
    ? _.every(loadType, t => data.hasOwnProperty(t))
    : data.hasOwnProperty(loadType);
}

/**
 * Basic parsing function for meter groups
 *
 * @param {MeterGroup} meterGroup - The raw meter group object obtained from the back-end
 */
export function parseMeterGroup (meterGroup: RawMeterGroup): MeterGroup {
  // customer clusters are always considered to be completed
  if (meterGroup.object_type === 'CustomerCluster') {
    return {
      ...meterGroup,
      progress: { is_complete: true, percent_complete: 100 }
    };
  }
  
  const percentComplete = meterGroup.metadata.expected_meter_count === null
    ? 0
    : math.percentOf(
        meterGroup.meter_count,
        meterGroup.metadata.expected_meter_count
      );
  
  return {
    ...meterGroup,
    metadata: {
      ...meterGroup.metadata,
      filename: meterGroup.metadata.filename.replace(/origin_files\//, '')
    },
    progress: {
      is_complete: percentComplete === 100,
      percent_complete: parseFloat(percentComplete.toFixed(1))
    },
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

/**
 * Determines if a meter group is sufficiently ingested for certain actions, including running a
 * scenario with it or viewing its frame 288's. If the meter group is a CustomerCluster, the
 * answer is always "yes". If it's an OriginFile, then we will first confirm that the upload has
 * been at least 95% ingested.
 *
 * @param {MeterGroup} meterGroup: the meter group we want to run a scenario with
 */
export function isSufficientlyIngested (meterGroup: MeterGroup | undefined) {
  if (!meterGroup) return false;
  if (meterGroup.object_type === 'CustomerCluster') return true;
  
  // If origin files have sufficiently finished ingesting, they are selectable. We don't
  // require 100% completion in case a few meters fail to ingest.
  const sufficientlyFinishedPercent = 95;
  return meterGroup.progress.percent_complete >= sufficientlyFinishedPercent;
}

export class Frame288Numeric {
  static months = _.range(1, 13) as MonthIndex[];
  readonly flattened: number[];
  readonly frame: Frame288NumericType;

  constructor (frame: Frame288NumericType) {
    this.frame = frame;
    this.flattened = _.flatten(Frame288Numeric.months.map(i => this.frame[i]));
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
