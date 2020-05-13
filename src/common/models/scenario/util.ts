import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import pick from 'lodash/pick';

import { parsePandasFrame } from 'navigader/models';
import { math } from 'navigader/util';
import {
  RawScenarioReport, ScenarioReport, RawScenario, Scenario, RawScenarioReportSummary
} from './types';


/** ============================ Utils ===================================== */
/**
 * Basic parsing function for converting a RawScenario into a Scenario
 *
 * @param {RawScenario} scenario - The raw scenario object to parse
 */
export function parseScenario (scenario: RawScenario): Scenario {
  const { der_simulation_count, expected_der_simulation_count } = scenario;
  const percentComplete = expected_der_simulation_count === 0
    ? 0
    : math.percentOf(der_simulation_count, expected_der_simulation_count);
  
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
    ...pick(scenario, 'created_at', 'data', 'id', 'name', 'object_type'),
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
      ...omit(parsed, 'SA ID'),
      SA_ID: parsed['SA ID']
    },
    rows
  };
}

function hasReport (report: RawScenario['report']): report is RawScenarioReport {
  return Boolean(report && !report.hasOwnProperty('index'));
}

function hasReportSummary (
  summary: RawScenario['report_summary']
): summary is RawScenarioReportSummary {
  return Boolean(summary && !isEmpty(summary));
}
