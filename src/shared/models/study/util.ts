import omit from 'lodash/omit';

import { parseNavigaderObject, parsePandasFrame } from '@nav/shared/util';
import { MultiScenarioStudy, RawMultiScenarioStudy, RawStudyReport, StudyReport } from './types';


/**
 * Basic parsing function for converting a RawMultiScenarioStudy into a MultiScenarioStudy
 *
 * @param {RawMultiScenarioStudy} study - The raw multi-scenario study object obtained to parse
 */
export function parseMultiScenarioStudy (study: RawMultiScenarioStudy): MultiScenarioStudy {
  return {
    ...parseNavigaderObject(study),
    derSimulations: study.der_simulations,
    metadata: {
      singleScenarioStudies: study.metadata.single_scenario_studies
    },
    meterCount: study.meter_count,
    meterGroups: study.meter_groups,
    meters: study.meters,
    report: parseReport(study.report)
  };
}

function parseReport (report: RawStudyReport): StudyReport {
  const parsed = parsePandasFrame(report);
  return {
    ...omit(parsed, 'report'),
    saId: parsed['SA ID']
  };
}
