import { isMeterGroup, MeterGroup } from 'navigader/types';


/**
 * Returns a display name for the given meter group
 *
 * @param {MeterGroup} meterGroup: the meter group object to display. The overload that accepts
 *   undefined is there to enable usage in situations where the meter group is optional
 */
export function getDisplayName (meterGroup: any) {
  if (!isMeterGroup(meterGroup)) return '';
  switch (meterGroup.object_type) {
    case 'OriginFile':
      return meterGroup.name || meterGroup.metadata.filename.replace(/origin_files\//, '');
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
