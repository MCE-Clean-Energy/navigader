import {
  DynamicRestParams, Frame288Numeric, GHGRate, LoadType, MeterGroup, PaginationQueryParams,
  RawGHGRate, RawPaginationSet, RawScenario, Scenario
} from 'navigader/types';
import _ from 'navigader/util/lodash';
import {
  appendId, beoRoute, deleteRequest, getRequest, parseMeterGroup, parsePaginationSet, parseScenario,
  patchRequest, postRequest
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

// GET /ghg_rate/
type GetGHGRatesResponse = {
  ghg_rates: RawGHGRate[];
};

type GetGHGRatesQueryOptions = PaginationQueryParams & Partial<DynamicRestParams> & (
  { data_format: '288'; } |
  { data_format: 'interval'; period: '1H' | '15M'; start: string; end_limit: string; }
);

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

/** ============================ GHG ======================================= */
export async function getGhgRates (options?: GetGHGRatesQueryOptions) {
  const response: RawPaginationSet<GetGHGRatesResponse>
    = await getRequest(routes.ghg_rate, options).then(res => res.json());
  
  // Parse the GHG rate results into full-fledged `NavigaderObjects`
  return parsePaginationSet(response, ({ ghg_rates }) => ghg_rates.map(parseGhgRate));
}

/** ============================ Helpers =================================== */
const baseRoute = (rest: string) => beoRoute.v1(`cost/${rest}`);
const routes = {
  ghg_rate: baseRoute('ghg_rate/'),
  postStudy: baseRoute('multiple_scenario_study/'),
  scenarios: appendId(baseRoute('study'))
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
    const scenarioMeterGroup = _.find(meterGroups, { id: scenario.meter_groups[0] });
    if (scenarioMeterGroup) {
      meterGroup = parseMeterGroup(scenarioMeterGroup);
    }
  }
  
  return {
    ...parseScenario(scenario),
    meter_group: meterGroup
  };
}

function parseGhgRate (rate: RawGHGRate): GHGRate {
  return {
    ...rate,
    data: rate.data ? new Frame288Numeric(rate.data, { name: rate.name, units: 'tCO2/kW' }) : undefined,
    id: rate.id.toString(),
    object_type: 'GHGRate',
    
    // This data isn't available for `GHGRate` objects
    created_at: new Date().toString(),
  };
}
