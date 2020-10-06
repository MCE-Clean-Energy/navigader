import {
  RawCAISORate, DataTypeParams, DynamicRestParams, PaginationQueryParams, RawGHGRate,
  RawPaginationSet, RawScenario, Scenario, RawMeterGroup
} from 'navigader/types';
import { appendQueryString, serializers } from 'navigader/util';
import {
  appendId, beoRoute, deleteRequest, downloadFile, getRequest, parsePaginationSet, patchRequest,
  postRequest, ProgressCallback
} from './util';


/** ============================ Types ===================================== */
type DerSelection = {
  configurationId: string;
  strategyId: string;
};

/** Query params */
export type GetScenarioQueryParams = DynamicRestParams<ScenarioIncludeFields> & DataTypeParams;
export type GetScenariosQueryParams = GetScenarioQueryParams & PaginationQueryParams;
type ScenarioIncludeFields =
  | 'ders'
  | 'der_simulations'
  | 'meters'
  | 'meter_group'
  | 'meter_group.*'
  | 'report'
  | 'report_summary';

type GetGHGRatesQueryOptions = PaginationQueryParams & DynamicRestParams & (
  { data_format: '288'; } |
  { data_format: 'interval'; period: '1H' | '15M'; start: string; end_limit: string; }
);

export type GetCAISORatesQueryOptions =
  & PaginationQueryParams
  & DynamicRestParams
  & DataTypeParams
  & { year?: number };

/** Responses */
type GetScenariosResponse = { meter_groups?: RawMeterGroup[]; scenarios: RawScenario[] };
type GetScenarioResponse = { meter_groups?: RawMeterGroup[]; scenario: RawScenario };
type GetGHGRatesResponse = { ghg_rates: RawGHGRate[] };
type GetCAISORatesResponse = { caiso_rates: RawCAISORate[] };

/** ============================ Scenarios =============================== */
export async function postStudy (
  scenarioName: string,
  meterGroupIds: string[],
  ders: DerSelection[]
) {
  return await postRequest(
    routes.scenarios(),
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
 * Loads scenario objects
 *
 * @param {GetScenariosQueryParams} queryParams: parameters for filtering the result set
 */
export async function getScenarios (queryParams: GetScenariosQueryParams) {
  const response: RawPaginationSet<GetScenariosResponse> =
    await getRequest(routes.scenarios(), queryParams).then(res => res.json());

  // Parse the meter results
  return parsePaginationSet(
    response,
    ({ meter_groups = [], scenarios }) =>
      scenarios.map(scenario => serializers.parseScenario(scenario, meter_groups))
  );
}

export async function patchScenario (scenarioId: string, updates: Partial<Scenario>) {
  return await patchRequest(
    routes.scenarios(scenarioId),
    updates
  );
}

export async function getScenario (id: string, queryParams?: GetScenarioQueryParams) {
  const { meter_groups = [], scenario }: GetScenarioResponse =
    await getRequest(routes.scenarios(id), queryParams).then(res => res.json());

  return serializers.parseScenario(scenario, meter_groups);
}

/**
 * Deletes a scenario given the ID
 *
 * @param {string} id: the ID of the scenario
 */
export async function deleteScenario (id: string) {
  return await deleteRequest(routes.scenarios(id));
}

/**
 * Downloads a CSV of summary-level scenario data
 *
 * @param {string[]} ids: the IDs of the scenarios to fetch summary data from
 */
export async function downloadSummaryData (ids: string[]) {
  const url = appendQueryString(routes.scenarios.download, {
    ids,
    level: 'summary'
  });
  return downloadFile(url, 'scenario-summary-data.csv');
}

/**
 * Downloads a CSV of customer-level scenario data
 *
 * @param {string[]} ids: the IDs of the scenarios to fetch customer data from
 * @param {ProgressCallback} onProgress: callback to execute when the download progresses
 */
export async function downloadCustomerData (ids: string[], onProgress?: ProgressCallback) {
  const url = appendQueryString(routes.scenarios.download, {
    ids,
    level: 'customer'
  });

  return downloadFile(url, 'scenario-customer-data.csv', onProgress);
}

/** ============================ GHG ======================================= */
export async function getGhgRates (options?: GetGHGRatesQueryOptions) {
  const response: RawPaginationSet<GetGHGRatesResponse>
    = await getRequest(routes.ghg_rate, options).then(res => res.json());

  // Parse the GHG rate results into full-fledged `NavigaderObjects`
  return parsePaginationSet(response, ({ ghg_rates }) => ghg_rates.map(serializers.parseGHGRate));
}

/** ============================ Procurement =============================== */
export async function getCAISORates (options?: GetCAISORatesQueryOptions) {
  const response: RawPaginationSet<GetCAISORatesResponse>
    = await getRequest(routes.caiso_rate, options).then(res => res.json());

  // Parse the GHG rate results into full-fledged `NavigaderObjects`
  return parsePaginationSet(response, ({ caiso_rates }) => caiso_rates.map(serializers.parseCAISORate));
}

/** ============================ Helpers =================================== */
const baseRoute = (rest: string) => beoRoute.v1(`cost/${rest}`);
const routes = {
  caiso_rate: baseRoute('caiso_rate/'),
  ghg_rate: baseRoute('ghg_rate/'),
  scenarios: Object.assign(
    appendId(baseRoute('scenario')), {
      download: baseRoute('scenario/download/')
    }
  )
};
