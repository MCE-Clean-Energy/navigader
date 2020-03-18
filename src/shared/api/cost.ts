import { postRequest } from '@nav/shared/api/util';
import { MultiScenarioStudy } from '@nav/shared/models/study';
import { parseMultiScenarioStudy } from '../models/study';


/** ============================ Types ===================================== */
type DerSelection = {
  configurationId: string;
  strategyId: string;
}
/** ============================ API Methods =============================== */
export async function postStudy (
  studyName: string,
  meterGroupIds: string[],
  ders: DerSelection[]
): Promise<MultiScenarioStudy> {
  return await postRequest(
    routes.studyPost,
    {
      name: studyName,
      meter_group_ids: meterGroupIds,
      ders: ders.map(({ configurationId, strategyId }) => ({
        der_configuration_id: configurationId,
        der_strategy_id: strategyId
      }))
    }
  )
    .then(res => res.json())
    .then(rawStudy => parseMultiScenarioStudy(rawStudy));
}

/** ============================ Helpers =================================== */
const baseRoute = (rest: string) => `${process.env.REACT_APP_BEO_URI}/v1/cost/${rest}`;
const routes = {
  studyPost: baseRoute('multiple_scenario_study/')
};
