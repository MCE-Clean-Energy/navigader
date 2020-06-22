import {
  MeterGroup, PandasFrame, RawMeterGroup, RawPandasFrame, RawScenario, RawScenarioReport,
  RawScenarioReportSummary, Scenario, ScenarioReport
} from 'navigader/types';
import { percentOf } from 'navigader/util/math';
import _ from 'navigader/util/lodash';


/** ============================ Meter Groups ============================== */
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
    : percentOf(
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
  const reportSummary = hasReportSummary(scenario.report_summary)
    ? scenario.report_summary[0]
    : undefined;
  
  // If we have the report or the report summary (i.e. it isn't undefined) and it's empty, then the
  // report hasn't been built yet and so the scenario hasn't undergone aggregation. If we have
  // neither the report nor the summary, it's likely that the request didn't ask for them and we
  // can't tell if it's aggregated or not and will assume it hasn't
  const hasAggregated = scenario.report === undefined && scenario.report_summary === undefined
    ? false
    : Boolean(hasRun && (report || reportSummary));
  
  return {
    ..._.pick(scenario, 'created_at', 'data', 'id', 'name', 'object_type'),
    der: scenario.ders ? scenario.ders[0] : undefined,
    der_simulation_count: scenario.der_simulation_count,
    der_simulations: scenario.der_simulations,
    expected_der_simulation_count: scenario.expected_der_simulation_count,
    metadata: scenario.metadata,
    meter_count: scenario.meter_count,
    meters: scenario.meters,
    progress: {
      is_complete: hasAggregated,
      has_run: hasRun,
      percent_complete: parseFloat(percentComplete.toFixed(1))
    },
    report: parseReport(scenario.report),
    report_summary: reportSummary
  };
}

export function parseReport (report?: RawScenario['report']): ScenarioReport | undefined {
  if (!hasReport(report)) return;
  const parsed = parsePandasFrame(report);
  
  // For every simulation ID in the report, gather the values associated with that ID from the
  // other columns and compile them into an object
  const rows = Object.fromEntries((parsed.ID || []).map((simulationId, rowIndex) => {
    const simulationFields = Object.entries(parsed).map(
      ([column, values]) => {
        const rowValue = values && values[rowIndex];
        const columnName = column === 'SA ID' ? 'SA_ID' : column;
        return [columnName, rowValue];
      }
    );
    
    return [simulationId, Object.fromEntries(simulationFields)];
  }));
  
  return {
    columns: {
      ..._.omit(parsed, 'SA ID'),
      SA_ID: parsed['SA ID']
    },
    rows
  };
}

function hasReportSummary (
  summary: RawScenario['report_summary']
): summary is RawScenarioReportSummary {
  return Boolean(summary && !_.isEmpty(summary));
}

function hasReport (report: RawScenario['report']): report is RawScenarioReport {
  return Boolean(report && !report.hasOwnProperty('index'));
}

/** ============================ Miscellaneous ============================= */
/**
 * Parses a `RawPandasFrame` into a `PandasFrame`, which involves converting the indexed objects
 * into arrays
 *
 * @param {RawPandasFrame} frame: the pandas frame to parse
 */
export function parsePandasFrame<T extends Record<string, any>> (
  frame: RawPandasFrame<T>
): PandasFrame<T> {
  const frameProps: [keyof T, T[keyof T][]][] = [];
  
  Object.keys(frame).forEach((key: keyof T) => {
    // Sort the keys numerically, not alphabetically
    const orderedIndices = Object.keys(frame[key]).sort((index1, index2) => {
      const numeric1 = +index1;
      const numeric2 = +index2;
      
      if (numeric1 < numeric2) return -1;
      if (numeric2 < numeric1) return 1;
      return 0;
    });
    
    frameProps.push([key, orderedIndices.map(index => frame[key][+index])]);
  });
  
  return frameProps.reduce((parsedFrame, [key, value]) => {
    parsedFrame[key] = value;
    return parsedFrame;
  }, {} as PandasFrame<T>);
}
