import find from 'lodash/find';

import { parseMeterGroup, RawMeterGroup } from '@nav/shared/models/meter';
import {
  parseScenario, RawScenario, Scenario, DeferrableScenarioFields
} from '@nav/shared/models/scenario';
import {
  DynamicRestParams, PaginationQueryParams, PaginationSet, RawPaginationSet
} from '@nav/shared/types';
import {
  appendId, beoRoute, getRequest, makePaginationQueryParams, parsePaginationSet, postRequest
} from './util';


/** ============================ Types ===================================== */
type DerSelection = {
  configurationId: string;
  strategyId: string;
};

type ScenarioQueryParams = Partial<PaginationQueryParams & DynamicRestParams & {
  type: Scenario['objectType'];
}>;

type ScenariosResponse<T extends DeferrableScenarioFields> = {
  meter_groups?: RawMeterGroup[];
  studies: RawScenario<T>[];
};

/** ============================ API Methods =============================== */
export async function postStudy (
  scenarioName: string,
  meterGroupIds: string[],
  ders: DerSelection[]
): Promise<Response> {
  return await postRequest(
    routes.postStudy,
    {
      name: scenarioName,
      meter_group_ids: meterGroupIds,
      ders: ders.map(({ configurationId, strategyId }) => ({
        der_configuration_id: configurationId,
        der_strategy_id: strategyId
      }))
    }
  );
}

/**
 * Loads scenario objects, either `SingleScenarioScenario` or `MultipleScenarioScenario`. The `ScenarioType`
 * generic type must be set to one of those two types.
 *
 * @param {ScenarioQueryParams} queryParams: parameters for filtering the result set
 */
export async function getScenarios<IncludedFields extends DeferrableScenarioFields>(
  queryParams?: ScenarioQueryParams
): Promise<PaginationSet<Scenario<IncludedFields>>> {
  const response: RawPaginationSet<ScenariosResponse<IncludedFields>> =
    await getRequest(
      routes.getScenarios(),
      makeQueryParams({
        ...queryParams,
        type: 'SingleScenarioStudy'
      })
    ).then(res => res.json());
  
  // Parse the meter results
  return parsePaginationSet(
    response,
    ({ meter_groups, studies: scenarios }) =>
      scenarios.map((scenario) => {
        // Mix in the meter group
        let meterGroup = null;
        if (scenario.meter_groups && scenario.meter_groups.length > 0) {
          const scenarioMeterGroup = find(meter_groups, { id: scenario.meter_groups[0] });
          if (scenarioMeterGroup) {
            meterGroup = parseMeterGroup(scenarioMeterGroup);
          }
        }
        
        return {
          ...parseScenario(scenario),
          meter_group: meterGroup
        };
      })
  );
}

/** ============================ Helpers =================================== */
const baseRoute = (rest: string) => beoRoute.v1(`cost/${rest}`);
const routes = {
  getScenarios: appendId(baseRoute('study')),
  postStudy: baseRoute('multiple_scenario_study/')
};

function makeQueryParams (queryParams?: ScenarioQueryParams) {
  if (!queryParams) return;
  return {
    ...makePaginationQueryParams(queryParams),
    include: queryParams.include,
    object_type: queryParams.type,
  };
}
