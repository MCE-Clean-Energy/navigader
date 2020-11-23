import { DurationUnit, Interval } from 'luxon';

import {
  AbstractMeterGroup,
  isOriginFile,
  isScenario,
  Maybe,
  Nullable,
  OriginFile,
} from 'navigader/types';

/** ============================ Constants ================================= */
const MAX_METER_GROUP_TIMESPAN_DAYS = 366;
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

/**
 * Determines if a meter group is too long to run a simulation with. The modeling currently
 * constrains a meter group to be not more than 366 days. If the meter group's date range is longer
 * than that, returns `true`. Otherwise, even if no meter group is provided or it has no date range,
 * returns `false`.
 *
 * @param {AbstractMeterGroup} meterGroup: the meter group to check
 */
export function spansMoreThanAYear(meterGroup: Maybe<AbstractMeterGroup>) {
  const interval = getDateRangeInterval(meterGroup, 'days');

  // Returns `true` if the interval could be determined and is too long
  return interval !== null && interval > MAX_METER_GROUP_TIMESPAN_DAYS;
}

/**
 * Returns a luxon `Interval` object representing the meter group's timespan. If the date range
 * is not available, return `null`. If a second parameter, `unit`, is provided, returns the length
 * of the interval in the given unit
 *
 * @param {AbstractMeterGroup} meterGroup: the meter group to return the interval of
 * @param {DurationUnit} unit: the unit in which to return the interval length. If not provided,
 *   the interval itself is returned
 */
export function getDateRangeInterval(
  meterGroup: Maybe<AbstractMeterGroup>,
  unit: DurationUnit
): Nullable<number>;
export function getDateRangeInterval(meterGroup: Maybe<AbstractMeterGroup>): Nullable<Interval>;
export function getDateRangeInterval(meterGroup: Maybe<AbstractMeterGroup>, unit?: DurationUnit) {
  if (!meterGroup || !meterGroup.date_range) return null;
  const [start, endLimit] = meterGroup.date_range;
  const interval = Interval.fromDateTimes(start, endLimit);
  return unit ? interval.length(unit) : interval;
}
