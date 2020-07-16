import {
  AggregatedProcurementKeys,
  CAISORate, DataTypeMap, Frame288Numeric, GHGRate, IntervalDataWrapper, Meter, MeterGroup,
  PandasFrame,
  ProcurementReport, RawCAISORate, RawDataTypeMap, RawGHGRate, RawMeter, RawMeterGroup,
  RawPandasFrame,
  RawScenario, Scenario, ScenarioReport, ScenarioReportFields
} from 'navigader/types';
import { percentOf } from './math';
import _ from './lodash';
import { isRawScenarioReport, isRawScenarioReportSummary } from './typeGuards';


/** ============================ Meters ==================================== */
export function parseMeter (meter: RawMeter): Meter {
  return {
    ...meter,
    data: parseDataField(meter.data, meter.metadata.sa_id.toString(), 'kw', 'index')
  };
}

export function serializeMeter (meter: Meter): RawMeter {
  return {
    ...meter,
    data: serializeDataField(meter.data, 'kw', 'index')
  };
}

/** ============================ Meter Groups ============================== */
/**
 * Basic parsing function for meter groups
 *
 * @param {MeterGroup} meterGroup - The raw meter group object obtained from the back-end
 */
export function parseMeterGroup (meterGroup: RawMeterGroup): MeterGroup {
  const data = parseDataField(meterGroup.data, meterGroup.name, 'kw', 'index');
  
  // customer clusters are always considered to be completed
  if (meterGroup.object_type === 'CustomerCluster') {
    return {
      ...meterGroup,
      data,
      progress: { is_complete: true, percent_complete: 100 }
    };
  }
  
  const percentComplete = meterGroup.metadata.expected_meter_count === null
    ? 0
    : percentOf(
      meterGroup.meter_count,
      meterGroup.metadata.expected_meter_count
    );
  
  return {
    ...meterGroup,
    data,
    metadata: {
      ...meterGroup.metadata,
      filename: meterGroup.metadata.filename.replace(/origin_files\//, '')
    },
    progress: {
      is_complete: percentComplete === 100,
      percent_complete: parseFloat(percentComplete.toFixed(1))
    }
  };
}

/** ============================ Scenarios ================================= */
/**
 * Basic parsing function for converting a RawScenario into a Scenario
 *
 * @param {RawScenario} scenario - The raw scenario object to parse
 */
export function parseScenario (scenario: RawScenario): Scenario {
  const { der_simulation_count, expected_der_simulation_count } = scenario;
  const percentComplete = expected_der_simulation_count === 0
    ? 0
    : percentOf(der_simulation_count, expected_der_simulation_count);
  
  const hasRun = percentComplete === 100;
  const report = parseReport(scenario.report);
  const reportSummary = parseReportSummary(scenario.report_summary);
  
  // If we have the report or the report summary (i.e. it isn't undefined) and it's empty, then the
  // report hasn't been built yet and so the scenario hasn't undergone aggregation. If we have
  // neither the report nor the summary, it's likely that the request didn't ask for them and we
  // can't tell if it's aggregated or not and will assume it hasn't
  const hasAggregated = scenario.report === undefined && scenario.report_summary === undefined
    ? false
    : Boolean(hasRun && (report || reportSummary));
  
  const unchangedFields = _.pick(scenario,
    'created_at',
    'der_simulation_count',
    'der_simulations',
    'expected_der_simulation_count',
    'id',
    'metadata',
    'meter_count',
    'meters',
    'name',
    'object_type'
  );
  
  return {
    ...unchangedFields,
    data: parseDataField(scenario.data || {}, scenario.name, 'kw', 'index'),
    der: scenario.ders ? scenario.ders[0] : undefined,
    progress: {
      is_complete: hasAggregated,
      has_run: hasRun,
      percent_complete: parseFloat(percentComplete.toFixed(1))
    },
    report: parseReport(scenario.report),
    report_summary: reportSummary
  };
}

export function parseReport (report: RawScenario['report']): ScenarioReport | undefined {
  if (!isRawScenarioReport(report)) return;
  const parsed = parsePandasFrame(report);
  
  // For every simulation ID in the report, gather the values associated with that ID from the
  // other columns and compile them into an object
  return Object.fromEntries((parsed.ID || []).map((simulationId, rowIndex) => {
    const simulationFields = Object.fromEntries(
      Object.entries(parsed).map(
        ([column, values]) => {
          const rowValue = values && values[rowIndex];
          const columnName = column === 'SA ID' ? 'SA_ID' : column;
          return [columnName, rowValue];
        }
      )
    );
    
    return [
      simulationId,
      {
        ...simulationFields,
        ...parseReportProcurementFields(simulationFields)
      } as ScenarioReportFields
    ];
  }));
}

function parseReportSummary (summary: RawScenario['report_summary']) {
  if (!isRawScenarioReportSummary(summary)) return undefined;
  return {
    ...summary[0],
    ...parseReportProcurementFields(summary[0])
  };
}

/**
 * Reduces the procurement costs from multiple years down to a single value
 *
 * @param {ProcurementReport} fields: the procurement data fields
 */
function parseReportProcurementFields (fields: ProcurementReport) {
  const {
    PRC_LMP2018Delta,
    PRC_LMP2018PostDER,
    PRC_LMP2018PreDER,
    PRC_LMP2019Delta,
    PRC_LMP2019PostDER,
    PRC_LMP2019PreDER,
    ...rest
  } = fields;
  
  return {
    ...rest,
    PRC_LMPDelta: _.sumBy([PRC_LMP2018Delta, PRC_LMP2019Delta]),
    PRC_LMPPostDER: _.sumBy([PRC_LMP2018PostDER, PRC_LMP2019PostDER]),
    PRC_LMPPreDER: _.sumBy([PRC_LMP2018PreDER, PRC_LMP2019PreDER])
  };
}

export function serializeReport (report: Scenario['report']) {
  if (!report) return;
  
  // First we collect all the report fields
  const reportRows = Object.values(report);
  const reportFields = new Set(
    ...reportRows.map(obj => Object.keys(obj))
  ) as Set<keyof ScenarioReportFields>;
  
  // Omit the aggregated procurement fields as they are computed
  const procKeys: AggregatedProcurementKeys[] = ['PRC_LMPDelta', 'PRC_LMPPostDER', 'PRC_LMPPreDER'];
  procKeys.forEach((field) => reportFields.delete(field));
  
  // For each of the fields, get each row's value
  const reportPairs = Array.from(reportFields).map((field) => {
    // "SA_ID" is handled specially
    const fieldName = field === 'SA_ID' ? 'SA ID' : field;
    return [fieldName, _.map(reportRows, field)]
  });
  
  return _.fromPairs(reportPairs) as RawScenario['report'];
}

function serializeReportSummary (summary: Scenario['report_summary']) {
  if (!summary) return;

  // Omit the aggregated procurement fields as they are computed
  const procKeys: AggregatedProcurementKeys[] = ['PRC_LMPDelta', 'PRC_LMPPostDER', 'PRC_LMPPreDER'];
  return { 0: _.omit(summary, ...procKeys) };
}

export function serializeScenario (scenario: Scenario): RawScenario {
  const unchangedFields = _.pick(scenario,
    'created_at',
    'der_simulation_count',
    'der_simulations',
    'expected_der_simulation_count',
    'id',
    'metadata',
    'meter_count',
    'meters',
    'name',
    'object_type'
  );

  return {
    ...unchangedFields,
    data: serializeDataField(scenario.data, 'kw', 'index'),
    ders: scenario.der && [scenario.der],
    report: serializeReport(scenario.report),
    report_summary: serializeReportSummary(scenario.report_summary)
  };
}

/** ============================ GHG ======================================= */
export function parseGHGRate (rate: RawGHGRate): GHGRate {
  return {
    ...rate,
    data: rate.data ? new Frame288Numeric(rate.data, {
      name: rate.name,
      units: 'tCO2/kW'
    }) : undefined,
    id: rate.id.toString(),
    
    // This is declared as part of the `RawGHGRate` type but it isn't provided by the backend
    object_type: 'GHGRate',
    
    // This data isn't available for `GHGRate` objects
    created_at: new Date().toString()
  };
}

export function serializeGHGRate (rate: GHGRate): RawGHGRate {
  return {
    ...rate,
    data: rate.data?.frame,
    id: +rate.id
  }
}

/** ============================ CAISO Rates =============================== */
export function parseCAISORate (rate: RawCAISORate): CAISORate {
  return {
    ...rate,
    data: parseDataField(rate.data || {}, rate.name, '$/kwh', 'start'),
    
    // This is declared as part of the `RawCAISORate` type but it isn't
    // provided by the backend
    object_type: 'CAISORate'
  };
}

export function serializeCAISORate (rate: CAISORate): RawCAISORate {
  return {
    ...rate,
    data: serializeDataField(rate.data, '$/kwh', 'start')
  }
}

/** ============================ Pandas ==================================== */
/**
 * Parses a `RawPandasFrame` into a `PandasFrame`, which involves converting the indexed objects
 * into arrays
 *
 * @param {RawPandasFrame} frame: the pandas frame to parse
 */
export function parsePandasFrame<T extends Record<string, any>> (
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
    
    return [key, orderedIndices.map(index => frame[key][+index])];
  });
  
  return _.fromPairs(frameProps) as PandasFrame<T>;
}

/**
 * Serializes a `PandasFrame` into a `RawPandasFrame`, typically to save to the store
 *
 * @param {PandasFrame} frame: the parsed Pandas frame to serialize
 */
export function serializePandasFrame<T extends Record<string, any>> (
  frame: PandasFrame<T>
): RawPandasFrame<T> {
  const frameKeys = Object.keys(frame);
  const frameProps = frameKeys.map((key: keyof T) => {
    return [
      key,
      frame[key].reduce((frameField, a, i) => ({ ...frameField, [i]: a }), {})
    ];
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
function parseDataField <Column extends string, Unit extends string>(
  obj: RawDataTypeMap<Unit, Column>,
  name: string,
  unit: Unit,
  column: Column
): DataTypeMap {
  return {
    ...obj,
    default: obj.default
      ? IntervalDataWrapper.create(
        {...obj.default, name },
        column,
        unit
      )
      : undefined
  };
}

/**
 *
 * @param obj
 * @param unit
 * @param column
 */
function serializeDataField <Column extends string, Unit extends string>(
  obj: DataTypeMap,
  unit: Unit,
  column: Column
): RawDataTypeMap<Unit, Column> {
  return {
    ...obj,
    default: obj.default
      ? obj.default.serialize(unit, column)
      : undefined
  };
}
