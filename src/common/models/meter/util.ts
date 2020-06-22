import { LoadType, LoadTypeMap, MeterDataField, MeterGroup } from 'navigader/types';
import _ from 'navigader/util/lodash';
import { isMeterGroup } from 'navigader/util/typeGuards';


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
 * Returns a display name for the given meter group
 *
 * @param {MeterGroup} meterGroup: the meter group object to display. The overload that accepts
 *   undefined is there to enable usage in situations where the meter group is optional
 */
export function getMeterGroupDisplayName (meterGroup: any) {
  if (!isMeterGroup(meterGroup)) return '';
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
