import find from 'lodash/find';

import { LoadType, parseMeterGroup, MeterGroup } from 'navigader/models/meter';
import { parseScenario, RawScenario, Scenario } from 'navigader/models/scenario';
import {
  appendId, beoRoute, deleteRequest, DynamicRestParams, getRequest, PaginationQueryParams,
  parsePaginationSet,
  patchRequest, postRequest, RawPaginationSet
} from './util';


/** ============================ Types ===================================== */
type DerSelection = {
  configurationId: string;
  strategyId: string;
};

// GET /study/
type GetScenariosQueryOptions = PaginationQueryParams & Partial<DynamicRestParams>;

type GetScenariosResponse = {
  meter_groups?: MeterGroup[];
  studies: RawScenario[];
};

// GET /study/:id
type GetScenarioResponse = {
  meter_groups?: [MeterGroup];
  study: RawScenario;
};

type GetScenarioQueryOptions = Partial<DynamicRestParams> & {
  data_types?: LoadType | LoadType[];
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
 * Loads scenario objects, either `SingleScenarioScenario` or `MultipleScenarioScenario`.
 *
 * @param {GetScenariosQueryOptions} queryParams: parameters for filtering the result set
 */
export async function getScenarios (queryParams: GetScenariosQueryOptions) {
  const response: RawPaginationSet<GetScenariosResponse> =
    await getRequest(
      routes.scenarios(),
      {
        ...queryParams,
        object_type: 'SingleScenarioStudy'
      }
    ).then(res => res.json());
  
  // Parse the meter results
  return parsePaginationSet(
    response,
    ({ meter_groups, studies: scenarios }) =>
      scenarios.map(scenario => compileScenario(scenario, meter_groups))
  );
}

export async function patchScenario (scenarioId: string, updates: Partial<Scenario>) {
  return await patchRequest(
    routes.scenarios(scenarioId),
    updates
  );
}

export async function getScenario (id: string, options?: GetScenarioQueryOptions) {
  const response: GetScenarioResponse =
    await getRequest(
      routes.scenarios(id),
      options
    ).then(res => res.json());
  
  return compileScenario(response.study, response.meter_groups);
}

/**
 * Deletes a scenario given the ID
 *
 * @param {string} id: the ID of the scenario
 */
export async function deleteScenario (id: string) {
  return await deleteRequest(routes.scenarios(id));
}

/** ============================ Helpers =================================== */
const baseRoute = (rest: string) => beoRoute.v1(`cost/${rest}`);
const routes = {
  scenarios: appendId(baseRoute('study')),
  postStudy: baseRoute('multiple_scenario_study/')
};

/**
 * Takes a raw scenario and array of raw meter groups and compiles the parsed scenario for use in
 * the application
 *
 * @param {RawScenario} scenario: the server-supplied scenario object
 * @param {MeterGroup} meterGroups: the server-supplied meter group objects
 */
function compileScenario (
  scenario: RawScenario,
  meterGroups?: MeterGroup[]
): Scenario {
  // Mix in the meter group
  let meterGroup;
  if (scenario.meter_groups && scenario.meter_groups.length > 0) {
    const scenarioMeterGroup = find(meterGroups, { id: scenario.meter_groups[0] });
    if (scenarioMeterGroup) {
      meterGroup = parseMeterGroup(scenarioMeterGroup);
    }
  }
  
  return {
    ...parseScenario(scenario),
    meter_group: meterGroup
  };
}
