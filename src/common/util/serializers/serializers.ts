import _ from 'lodash';
import { DateTime } from 'luxon';

import {
  AbstractMeterGroup,
  AbstractRawMeterGroup,
  CAISORate,
  DataTypeMap,
  GHGRate,
  isRawScenarioReport,
  isRawScenarioReportSummary,
  Meter,
  MeterGroup,
  OriginFile,
  PandasFrame,
  RawCAISORate,
  RawDataTypeMap,
  RawGHGRate,
  RawMeter,
  RawMeterGroup,
  RawOriginFile,
  RawPandasFrame,
  RawScenario,
  Scenario,
  ScenarioReport,
  ScenarioReportFields,
  RawSystemProfile,
  SystemProfile,
} from 'navigader/types';
import { Frame288Numeric, makeIntervalData, percentOf } from '../data';

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
  };
}

export function serializeSystemProfile(profile: SystemProfile): RawSystemProfile {
  return {
    ...profile,
    data: serializeDataField(profile.data, 'kw', 'index'),
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

/**
 * Helper function for parsing the meter group's `date_range` field
 *
 * @param {Tuple<String>} range: the range of the meter group as provided by the back end
 */
function parseDateRange(
  range: AbstractRawMeterGroup['date_range']
): AbstractMeterGroup['date_range'] {
  return range.includes(NOT_A_TIME) ? null : [parseDate(range[0]), parseDate(range[1])];
}

export function serializeMeterGroup(meterGroup: AbstractMeterGroup): AbstractRawMeterGroup {
  const { date_range } = meterGroup;
  return {
    ...meterGroup,
    data: serializeDataField(meterGroup.data, 'kw', 'index'),
    date_range:
      date_range === null
        ? [NOT_A_TIME, NOT_A_TIME]
        : [serializeDate(date_range[0]), serializeDate(date_range[1])],
  };
}

/** ============================ Origin Files ============================== */
export function parseOriginFile(rawOriginFile: RawOriginFile): OriginFile {
  const percentComplete =
    rawOriginFile.metadata.expected_meter_count === null
      ? 0
      : percentOf(rawOriginFile.meter_count, rawOriginFile.metadata.expected_meter_count);

  const unchangedFields = _.pick(rawOriginFile, 'metadata', 'object_type');

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
  const unchangedFields = _.pick(originFile, 'metadata', 'object_type');

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
    id: rate.id,

    // This is declared as part of the `RawGHGRate` type but it isn't provided by the backend
    object_type: 'GHGRate',
  };
}

export function serializeGHGRate(rate: GHGRate): RawGHGRate {
  return {
    ...rate,
    data: rate.data?.frame,
    id: rate.id,
  };
}

/** ============================ CAISO Rates =============================== */
export function parseCAISORate(rate: RawCAISORate): CAISORate {
  return {
    ...rate,
    data: parseDataField(rate.data || {}, rate.name, '$/kwh', 'start'),

    // This is declared as part of the `RawCAISORate` type but it isn't
    // provided by the backend
    object_type: 'CAISORate',
  };
}

export function serializeCAISORate(rate: CAISORate): RawCAISORate {
  return {
    ...rate,
    data: serializeDataField(rate.data, '$/kwh', 'start'),
  };
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
      obj && obj.default ? makeIntervalData({ ...obj.default, name }, column, unit) : undefined,
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
 * Parses a date string into a `Date` object, using Luxon. Note that using the `Date` constructor is
 * unreliable across browsers: ambiguous date strings that omit timezone info will be interpreted
 * differently by different browsers.
 *
 * @param {string} dateString: the string to parse.
 */
export function parseDate(dateString: string) {
  return DateTime.fromISO(dateString).toJSDate();
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
