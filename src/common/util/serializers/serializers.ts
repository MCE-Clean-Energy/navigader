import _ from 'lodash';
import { DateTime } from 'luxon';

import {
  AbstractMeterGroup,
  AbstractRawMeterGroup,
  CAISORate,
  DataTypeMap,
  DateRange,
  GHGRate,
  isRawScenarioReport,
  isRawScenarioReportSummary,
  Meter,
  MeterGroup,
  Nullable,
  OriginFile,
  PandasFrame,
  RatePlan,
  RawCAISORate,
  RawDataTypeMap,
  RawDateRange,
  RawGHGRate,
  RawMeter,
  RawMeterGroup,
  RawOriginFile,
  RawPandasFrame,
  RawRatePlan,
  RawScenario,
  RawSystemProfile,
  Scenario,
  ScenarioReport,
  ScenarioReportFields,
  SystemProfile,
} from 'navigader/types';
import { Frame288Numeric, IntervalData, percentOf } from '../data';

/** ============================ Meters ==================================== */
export function parseMeter(meter: RawMeter): Meter {
  return {
    ...meter,
    data: parseDataField(meter.data, meter.metadata.sa_id.toString(), 'kw', 'index'),
  };
}

export function serializeMeter(meter: Meter): RawMeter {
  return {
    ...meter,
    data: serializeDataField(meter.data, 'kw', 'index'),
  };
}

/** =========================== System Profiles ============================ */
export function parseSystemProfile(profile: RawSystemProfile): SystemProfile {
  return {
    ...profile,
    data: parseDataField(profile.data, profile.name, 'kw', 'index'),
    date_range: parseDateRange(profile.date_range),
  };
}

export function serializeSystemProfile(profile: SystemProfile): RawSystemProfile {
  return {
    ...profile,
    data: serializeDataField(profile.data, 'kw', 'index'),
    date_range: serializeDateRange(profile.date_range),
  };
}

/** ============================ Meter Groups ============================== */
// Python string representation of an invalid date
const NOT_A_TIME = 'NaT';

/**
 * Basic parsing function for meter groups. This is leveraged by `parseOriginFile` and
 * `parseScenario`
 *
 * @param {AbstractRawMeterGroup} meterGroup: the raw meter group object to parse
 */
function parseAbstractMeterGroup(meterGroup: AbstractRawMeterGroup): AbstractMeterGroup {
  return {
    ...meterGroup,
    data: parseDataField(meterGroup.data, meterGroup.name, 'kw', 'index'),
    date_range: parseDateRange(meterGroup.date_range),
  };
}

/**
 * Parses a raw meter group into a meter group. This discerns what type of meter group the input
 * object is and calls the appropriate parsing method.
 *
 * @param {RawMeterGroup} rawMeterGroup: the `OriginFile` or `Scenario` object to parse
 */
export function parseMeterGroup(rawMeterGroup: RawMeterGroup): MeterGroup {
  switch (rawMeterGroup.object_type) {
    case 'OriginFile':
      return parseOriginFile(rawMeterGroup);
    case 'Scenario':
      return parseScenario(rawMeterGroup);
  }
}

export function serializeMeterGroup(meterGroup: AbstractMeterGroup): AbstractRawMeterGroup {
  return {
    ...meterGroup,
    data: serializeDataField(meterGroup.data, 'kw', 'index'),
    date_range: serializeDateRange(meterGroup.date_range),
  };
}

/** ============================ Origin Files ============================== */
export function parseOriginFile(rawOriginFile: RawOriginFile): OriginFile {
  const percentComplete =
    rawOriginFile.metadata.expected_meter_count === null
      ? 0
      : percentOf(rawOriginFile.meter_count, rawOriginFile.metadata.expected_meter_count);

  const unchangedFields = _.pick(
    rawOriginFile,
    'has_gas',
    'metadata',
    'object_type',
    'total_therms'
  );

  return {
    ...parseAbstractMeterGroup(rawOriginFile),
    ...unchangedFields,
    progress: {
      is_complete: percentComplete === 100,
      percent_complete: parseFloat(percentComplete.toFixed(1)),
    },
  };
}

export function serializeOriginFile(originFile: OriginFile): RawOriginFile {
  const unchangedFields = _.pick(originFile, 'has_gas', 'metadata', 'object_type', 'total_therms');
  return {
    // Serialize the fields inherited from `MeterGroup`
    ...serializeMeterGroup(originFile),
    ...unchangedFields,
  };
}

/** ============================ Scenarios ================================= */
/**
 * Basic parsing function for converting a RawScenario into a Scenario
 *
 * @param {RawScenario} rawScenario: The raw scenario object to parse
 * @param {RawMeterGroup[]} [rawMeterGroups]: set of raw meter groups from which to draw the one
 *   associated with the scenario
 */
export function parseScenario(
  rawScenario: RawScenario,
  rawMeterGroups?: RawMeterGroup[]
): Scenario {
  const { der_simulation_count, expected_der_simulation_count } = rawScenario;
  const percentComplete =
    expected_der_simulation_count === 0
      ? 0
      : percentOf(der_simulation_count, expected_der_simulation_count);

  const reportSummary = parseReportSummary(rawScenario.report_summary);
  const unchangedFields = _.pick(
    rawScenario,
    'cost_functions',
    'der_simulation_count',
    'der_simulations',
    'expected_der_simulation_count',
    'metadata',
    'object_type'
  );

  // Mix in the meter group
  let meterGroup;
  if (rawScenario.meter_group) {
    const scenarioMeterGroup = _.find(rawMeterGroups, { id: rawScenario.meter_group });
    if (scenarioMeterGroup) {
      meterGroup = parseMeterGroup(scenarioMeterGroup);
    }
  }

  return {
    // Parse the fields inherited from `MeterGroup`
    ...parseAbstractMeterGroup(rawScenario),
    ...unchangedFields,
    der: rawScenario.ders ? rawScenario.ders[0] : undefined,
    meter_group: meterGroup,
    meter_group_id: rawScenario.meter_group,
    progress: {
      is_complete: rawScenario.metadata.is_complete,
      percent_complete: parseFloat(percentComplete.toFixed(1)),
    },
    report: parseReport(rawScenario.report),
    report_summary: reportSummary,
  };
}

export function parseReport(report: RawScenario['report']): ScenarioReport | undefined {
  if (!isRawScenarioReport(report)) return;
  const parsed = parsePandasFrame(report);

  // For every simulation ID in the report, gather the values associated with that ID from the
  // other columns and compile them into an object
  return Object.fromEntries(
    (parsed.ID || []).map((simulationId, rowIndex) => {
      const simulationFields = Object.fromEntries(
        Object.entries(parsed).map(([column, values]) => {
          const rowValue = values && values[rowIndex];
          const columnName = column === 'SA ID' ? 'SA_ID' : column;
          return [columnName, rowValue];
        })
      );

      return [simulationId, simulationFields as ScenarioReportFields];
    })
  );
}

export function serializeReport(report: Scenario['report']) {
  if (!report) return;

  // First we collect all the report fields
  const reportRows = Object.values(report);
  const reportFields = new Set(...reportRows.map((obj) => Object.keys(obj))) as Set<
    keyof ScenarioReportFields
  >;

  // For each of the fields, get each row's value
  const reportPairs = Array.from(reportFields).map((field) => {
    // "SA_ID" is handled specially
    const fieldName = field === 'SA_ID' ? 'SA ID' : field;
    return [fieldName, _.map(reportRows, field)];
  });

  return _.fromPairs(reportPairs) as RawScenario['report'];
}

function parseReportSummary(summary: RawScenario['report_summary']) {
  return isRawScenarioReportSummary(summary) ? summary[0] : undefined;
}

function serializeReportSummary(summary: Scenario['report_summary']) {
  return summary ? { 0: summary } : undefined;
}

export function serializeScenario(scenario: Scenario): RawScenario {
  const unchangedFields = _.pick(
    scenario,
    'cost_functions',
    'der_simulation_count',
    'der_simulations',
    'expected_der_simulation_count',
    'metadata',
    'object_type'
  );

  return {
    // Serialize the fields inherited from `MeterGroup`
    ...serializeMeterGroup(scenario),
    ...unchangedFields,
    ders: scenario.der && [scenario.der],
    meter_group: scenario.meter_group_id,
    report: serializeReport(scenario.report),
    report_summary: serializeReportSummary(scenario.report_summary),
  };
}

/** ============================ GHG ======================================= */
export function parseGHGRate(rate: RawGHGRate): GHGRate {
  return {
    ...rate,
    data: rate.data
      ? new Frame288Numeric(rate.data, {
          name: rate.name,
          units: 'tCO2/kW',
        })
      : undefined,
    effective: parseDate(rate.effective),
    id: rate.id,

    // This is declared as part of the `RawGHGRate` type but it isn't provided by the backend
    object_type: 'GHGRate',
  };
}

export function serializeGHGRate(rate: GHGRate): RawGHGRate {
  return {
    ...rate,
    data: rate.data?.frame,
    effective: serializeDate(rate.effective),
    id: rate.id,
  };
}

/** ============================ CAISO Rates =============================== */
export function parseCAISORate(rate: RawCAISORate): CAISORate {
  return {
    ...rate,
    data: parseDataField(rate.data || {}, rate.name, '$/kwh', 'start'),
    date_range: parseDateRange(rate.date_range),

    // This is declared as part of the `RawCAISORate` type but it isn't
    // provided by the backend
    object_type: 'CAISORate',
  };
}

export function serializeCAISORate(rate: CAISORate): RawCAISORate {
  return {
    ...rate,
    data: serializeDataField(rate.data, '$/kwh', 'start'),
    date_range: serializeDateRange(rate.date_range),
  };
}

/** ============================ Rate plans ================================ */
export function parseRatePlan(ratePlan: RawRatePlan): RatePlan {
  return {
    ...ratePlan,
    start_date: parseDateTime(ratePlan.start_date),

    // This field is included in the `RatePlan` type but not provided by the backend
    object_type: 'RatePlan',
  };
}

export function serializeRatePlan(ratePlan: RatePlan): RawRatePlan {
  return { ...ratePlan, start_date: serializeDateTime(ratePlan.start_date) };
}

/** ============================ Pandas ==================================== */
/**
 * Parses a `RawPandasFrame` into a `PandasFrame`, which involves converting the indexed objects
 * into arrays
 *
 * @param {RawPandasFrame} frame: the pandas frame to parse
 */
export function parsePandasFrame<T extends Record<string, any>>(
  frame: RawPandasFrame<T>
): PandasFrame<T> {
  const frameKeys = Object.keys(frame);
  const frameProps = frameKeys.map((key: keyof T) => {
    // Sort the keys numerically, not alphabetically
    const orderedIndices = Object.keys(frame[key]).sort((index1, index2) => {
      const numeric1 = +index1;
      const numeric2 = +index2;

      if (numeric1 < numeric2) return -1;
      if (numeric2 < numeric1) return 1;
      return 0;
    });

    return [key, orderedIndices.map((index) => frame[key][+index])];
  });

  return _.fromPairs(frameProps) as PandasFrame<T>;
}

/**
 * Serializes a `PandasFrame` into a `RawPandasFrame`, typically to save to the store
 *
 * @param {PandasFrame} frame: the parsed Pandas frame to serialize
 */
export function serializePandasFrame<T extends Record<string, any>>(
  frame: PandasFrame<T>
): RawPandasFrame<T> {
  const frameKeys = Object.keys(frame);
  const frameProps = frameKeys.map((key: keyof T) => {
    return [key, frame[key].reduce((frameField, a, i) => ({ ...frameField, [i]: a }), {})];
  });

  return _.fromPairs(frameProps) as RawPandasFrame<T>;
}

/** ============================ Data fields =============================== */
/**
 *
 * @param obj
 * @param name
 * @param unit
 * @param column
 */
function parseDataField<Column extends string, Unit extends string>(
  obj: RawDataTypeMap<Unit, Column>,
  name: string,
  unit: Unit,
  column: Column
): DataTypeMap {
  return {
    ...obj,
    default:
      obj && obj.default
        ? IntervalData.fromObject({ ...obj.default, name }, column, unit)
        : undefined,
  };
}

/**
 *
 * @param obj
 * @param unit
 * @param column
 */
function serializeDataField<Column extends string, Unit extends string>(
  obj: DataTypeMap,
  unit: Unit,
  column: Column
): RawDataTypeMap<Unit, Column> {
  return {
    ...obj,
    default: obj.default ? obj.default.serialize(unit, column) : undefined,
  };
}

/** ============================ Data fields =============================== */
/**
 * Parses a date string into a luxon DateTime object. Note that using the `Date` constructor is
 * unreliable across browsers: ambiguous date strings that omit timezone info will be interpreted
 * differently by different browsers.
 *
 * @param {Nullable<string>} dateString: the string to parse.
 */
export function parseDateTime(dateString: string): DateTime;
export function parseDateTime(dateString: null): null;
export function parseDateTime(dateString: Nullable<string>): Nullable<DateTime>;
export function parseDateTime(dateString: Nullable<string>): Nullable<DateTime> {
  if (_.isNull(dateString)) return null;
  return DateTime.fromISO(dateString);
}

/**
 * Parses a date string into a `Date` object, using Luxon. Note that using the `Date` constructor is
 * unreliable across browsers: ambiguous date strings that omit timezone info will be interpreted
 * differently by different browsers.
 *
 * TODO: replace this completely with parseLuxonDate-- will require editing a lot of types
 *
 * @param {Nullable<string>} dateString: the string to parse.
 */
export function parseDate(dateString: string): Date;
export function parseDate(dateString: null): null;
export function parseDate(dateString: Nullable<string>): Nullable<Date>;
export function parseDate(dateString: Nullable<string>) {
  return parseDateTime(dateString)?.toJSDate() ?? null;
}

/**
 * Serializes a luxon DateTime object into a string
 *
 * @param {Nullable<DateTime>} date: the luxon DateTime object to serialize
 */
export function serializeDateTime(date: DateTime): string;
export function serializeDateTime(date: null): null;
export function serializeDateTime(date: Nullable<DateTime>): Nullable<string>;
export function serializeDateTime(date: Nullable<DateTime>) {
  if (_.isNull(date)) return null;
  return serializeDate(date.toJSDate());
}

/**
 * Serializes a date object into a string. This simply wraps the `Date` prototype's `toISOString`
 * method. This method exists for the sake of consistency across the application. Note that we use
 * `toISOString` rather than `toString`, as the former is standardized and the latter varies across
 * browsers
 *
 * @param {Date} date: the date object to serialize
 */
export function serializeDate(date: Date) {
  return date.toISOString();
}

/**
 * Helper function for parsing the `date_range` fields. If either the start or the end of the range
 * is "NaT", returns `null`.
 *
 * @param {RawDateRange} range: a tuple of strings representing the start and end of the range
 */
function parseDateRange(range: RawDateRange['date_range']): DateRange['date_range'] {
  return range.includes(NOT_A_TIME) ? null : [parseDate(range[0]), parseDate(range[1])];
}

/**
 * Serializes a `date_range` field. If the range field is `null`, that implies that either the start
 * or the end of the raw date range contained "NaT". We can't know which at this point, so we will
 * serialize both the start and end as "NaT".
 *
 * @param {DateRange} range: the parsed date range object to serialize
 */
function serializeDateRange(range: DateRange['date_range']): RawDateRange['date_range'] {
  return range === null
    ? [NOT_A_TIME, NOT_A_TIME]
    : [serializeDate(range[0]), serializeDate(range[1])];
}
