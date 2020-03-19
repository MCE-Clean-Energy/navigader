import { MultiScenarioStudy, parseMultiScenarioStudy, RawMultiScenarioStudy } from '@nav/shared/models/study';
import { PaginationQueryParams, PaginationSet, RawPaginationSet } from '@nav/shared/types';
import { appendId, beoRoute, getRequest, parsePaginationSet, postRequest } from './util';


/** ============================ Types ===================================== */
type DerSelection = {
  configurationId: string;
  strategyId: string;
};

type StudyQueryParams = Partial<PaginationQueryParams & {
  withIds: boolean;
  withReport: boolean;
  withMetadata: boolean;
}>;

/** ============================ API Methods =============================== */
export async function postStudy (
  studyName: string,
  meterGroupIds: string[],
  ders: DerSelection[]
): Promise<MultiScenarioStudy> {
  return await postRequest(
    routes.postStudy,
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

export async function getStudies (
  queryParams?: StudyQueryParams
): Promise<PaginationSet<MultiScenarioStudy>> {
  const response: RawPaginationSet<RawMultiScenarioStudy> =
    await getRequest(
      routes.getStudies(),
      makeQueryParams(queryParams)
    ).then(res => res.json());
  
  // Parse the meter results
  return parsePaginationSet(response, parseMultiScenarioStudy);
}

/** ============================ Helpers =================================== */
const baseRoute = (rest: string) => beoRoute.v1(`cost/${rest}`);
const routes = {
  getStudies: appendId(baseRoute('study')),
  postStudy: baseRoute('multiple_scenario_study/')
};

function makeQueryParams (queryParams?: StudyQueryParams) {
  if (!queryParams) return null;
  return {
    ids: queryParams.withIds,
    report: queryParams.withReport,
    metadata: queryParams.withMetadata
  };
}
