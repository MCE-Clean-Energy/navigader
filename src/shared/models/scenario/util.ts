import omit from 'lodash/omit';
import pick from 'lodash/pick';

import { parsePandasFrame } from '@nav/shared/util';
import {
  RawScenarioReport, ScenarioReport, RawScenario, Scenario
} from './types';


/**
 * Basic parsing function for converting a RawScenario into a Scenario
 *
 * @param {RawScenario} scenario - The raw scenario object to parse
 */
export function parseScenario (scenario: RawScenario): Scenario {
  const percentComplete = parseFloat(
    (scenario.der_simulation_count / scenario.expected_der_simulation_count * 100).toFixed(1)
  );
  
  const reportSummary = scenario.report_summary ? scenario.report_summary[0] : undefined;
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
      is_complete: percentComplete === 100,
      percent_complete: percentComplete
    },
    report: parseReport(scenario.report),
    report_summary: reportSummary
  };
}

function parseReport (report?: RawScenarioReport): ScenarioReport | undefined {
  if (!report) return;
  const parsed = parsePandasFrame(report);
  
  // For every simulation ID in the report, gather the values associated with that ID from the
  // other columns and compile them into an object
  const rows = Object.fromEntries(parsed.ID.map((simulationId, rowIndex) => {
    const simulationFields = Object.entries(parsed).map(
      ([column, values]) => {
        const rowValue = values[rowIndex];
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
