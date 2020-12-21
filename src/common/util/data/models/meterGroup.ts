import { isOriginFile, isScenario, Maybe, OriginFile } from 'navigader/types';

/** ============================ Constants ================================= */
const MIN_INGESTION_PERCENTAGE = 95;

/** ============================ Methods =================================== */
/**
 * Returns a display name for the given meter group
 *
 * @param {any} meterGroup: the meter group object to display. The overload that accepts
 *   undefined is there to enable usage in situations where the meter group is optional
 */
export function getDisplayName(meterGroup: any) {
  if (isOriginFile(meterGroup)) {
    return meterGroup.name || meterGroup.metadata.filename.replace(/origin_files\//, '');
  } else if (isScenario(meterGroup)) {
    return meterGroup.name;
  } else return '';
}

/**
 * Determines if an origin file is sufficiently ingested for certain actions, including running a
 * scenario with it or viewing its frame 288's. An origin file is considered sufficiently ingested
 * if its upload is at least 95% complete.
 *
 * @param {OriginFile} originFile: the meter group we want to run a scenario with
 */
export function isSufficientlyIngested(originFile: Maybe<OriginFile>) {
  if (!originFile) return false;

  // If origin files have sufficiently finished ingesting, they are selectable. We don't
  // require 100% completion in case a few meters fail to ingest.
  return originFile.progress.percent_complete >= MIN_INGESTION_PERCENTAGE;
}
