import omit from 'lodash/omit';
import pick from 'lodash/pick';

import { parsePandasFrame } from '@nav/shared/util';
import {
  RawScenarioReport, ScenarioReport, RawScenario, Scenario, DeferrableScenarioFields
} from './types';

/**
 * Basic parsing function for converting a RawScenario into a Scenario
 *
 * @param {RawScenario} scenario - The raw scenario object to parse
 */
export function parseScenario <T extends DeferrableScenarioFields>(
  scenario: RawScenario<T>
): Scenario<T> {
  const percentComplete = parseFloat(
    (scenario.der_simulation_count / scenario.expected_der_simulation_count * 100).toFixed(1)
  );

  // @ts-ignore: for some reason TS says this is unassignable to a Scenario...
  return {
    ...pick(scenario, 'created_at', 'id', 'name', 'object_type'),
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
    report: parseReport(scenario.report)
  };
}

function parseReport (report?: RawScenarioReport) {
  if (!report) return;
  
  const parsed = parsePandasFrame(report);
  return {
    ...omit(parsed, 'report'),
    sa_id: parsed['SA ID']
  } as ScenarioReport;
}
