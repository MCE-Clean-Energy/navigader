import _ from 'lodash';

import store, { slices } from 'navigader/store';
import {
  RawCAISORate,
  DataTypeParams,
  DynamicRestParams,
  PaginationQueryParams,
  RawGHGRate,
  RawScenario,
  Scenario,
  RawMeterGroup,
  RateCollection,
  RatePlan,
  CostFunctions,
  SystemProfile,
  RawSystemProfile,
  GHGRate,
  CAISORate,
  IdType,
} from 'navigader/types';
import { appendQueryString, omitFalsey, serializers } from 'navigader/util';
import {
  appendId,
  beoRoute,
  deleteRequest,
  downloadFile,
  getRequest,
  makeFormXhrPost,
  parsePaginationSet,
  patchRequest,
  postRequest,
  ProgressCallback,
} from './util';

/** ============================ Types ===================================== */
type DerSelection = {
  configurationId: string;
  strategyId: string;
};

export type CostFunctionSelections = Partial<
  {
    [CF in keyof CostFunctions]: CostFunctions[CF]['id'];
  }
>;

/** Query params */
export type GetScenarioQueryParams = ScenarioDynamicRestParams & DataTypeParams;
export type GetScenariosQueryParams = GetScenarioQueryParams & PaginationQueryParams;
export type ScenarioDynamicRestParams = DynamicRestParams<
  'ders' | 'meter_group' | 'meter_group.*' | 'report' | 'report_summary'
>;

type GetGHGRatesQueryOptions = PaginationQueryParams &
  DynamicRestParams &
  (
    | { data_format: '288' }
    | { data_format: 'interval'; period: '1H' | '15M'; start: string; end_limit: string }
  );

export type GetCAISORatesQueryOptions = PaginationQueryParams &
  DynamicRestParams &
  DataTypeParams & { year?: number };

type RatePlanIncludeFields = 'rate_collections.*';
export type GetRatePlanQueryOptions = DynamicRestParams<RatePlanIncludeFields>;
export type GetRatePlansQueryOptions = GetRatePlanQueryOptions & PaginationQueryParams;
export type CreateRatePlanParams = Required<Pick<RatePlan, 'name' | 'sector'>>;
export type CreateRateCollectionParams = {
  rate_data_csv: File;
  rate_plan: string;
};

type SystemProfileIncludeFields = 'load_serving_entity.*';
export type GetSystemProfilesQueryOptions = GetSystemProfileQueryOptions & PaginationQueryParams;
export type GetSystemProfileQueryOptions = DynamicRestParams<SystemProfileIncludeFields> &
  DataTypeParams;

export type CreateSystemProfileParams = { file: File } & Pick<
  SystemProfile,
  'resource_adequacy_rate' | 'name'
>;
export type CreateCAISORateParams = { file: File } & Pick<CAISORate, 'name' | 'year'>;

/** Responses */
type GetScenariosResponse = { meter_groups?: RawMeterGroup[]; scenarios: RawScenario[] };
type GetScenarioResponse = { meter_groups?: RawMeterGroup[]; scenario: RawScenario };
type GetGHGRatesResponse = { ghg_rates: RawGHGRate[] };
type GetCAISORatesResponse = { caiso_rates: RawCAISORate[] };
type RawRatePlan = Omit<RatePlan, 'rate_collections'> & { rate_collections?: number[] };
type GetRatePlanResponse = { rate_collections?: RateCollection[]; rate_plan: RawRatePlan };
type GetRatePlansResponse = { rate_collections?: RateCollection[]; rate_plans: RawRatePlan[] };
type CreateRatePlanResponse = { rate_plan: RawRatePlan };
type GetSystemProfilesResponse = { system_profiles: RawSystemProfile[] };

/** ============================ Scenarios =============================== */
export async function postScenario(
  scenarioName: string,
  meterGroupIds: string[],
  ders: DerSelection[],
  costFunctions: CostFunctionSelections
) {
  return await postRequest(routes.scenarios(), {
    cost_functions: {
      ghg_rate: costFunctions.ghgRate,
      procurement_rate: costFunctions.caisoRate,
      rate_plan: costFunctions.ratePlan,
      system_profile: costFunctions.systemProfile,
    },
    name: scenarioName,
    meter_group_ids: meterGroupIds,
    ders: ders.map(({ configurationId, strategyId }) => ({
      der_configuration_id: configurationId,
      der_strategy_id: strategyId,
    })),
  });
}

/**
 * Loads scenario objects
 *
 * @param {GetScenariosQueryParams} queryParams: parameters for filtering the result set
 */
export async function getScenarios(queryParams: GetScenariosQueryParams) {
  const response = await getRequest(routes.scenarios(), queryParams).then((res) => res.json());

  // Parse the meter results
  return parsePaginationSet<GetScenariosResponse, Scenario>(
    response,
    ({ meter_groups = [], scenarios }) =>
      scenarios.map((scenario) => serializers.parseScenario(scenario, meter_groups))
  );
}

export async function patchScenario(scenarioId: string, updates: Partial<Scenario>) {
  return await patchRequest(routes.scenarios(scenarioId), updates);
}

export async function getScenario(id: string, queryParams?: GetScenarioQueryParams) {
  const { meter_groups = [], scenario }: GetScenarioResponse = await getRequest(
    routes.scenarios(id),
    queryParams
  ).then((res) => res.json());

  return serializers.parseScenario(scenario, meter_groups);
}

/**
 * Deletes a scenario given the ID
 *
 * @param {string} id: the ID of the scenario
 */
export async function deleteScenario(id: string) {
  return await deleteRequest(routes.scenarios(id));
}

/**
 * Downloads a CSV of summary-level scenario data
 *
 * @param {string[]} ids: the IDs of the scenarios to fetch summary data from
 */
export async function downloadSummaryData(ids: string[]) {
  const url = appendQueryString(routes.scenarios.download, {
    ids,
    level: 'summary',
  });
  return downloadFile(url, 'scenario-summary-data.csv');
}

/**
 * Downloads a CSV of customer-level scenario data
 *
 * @param {string[]} ids: the IDs of the scenarios to fetch customer data from
 * @param {ProgressCallback} onProgress: callback to execute when the download progresses
 */
export async function downloadCustomerData(ids: string[], onProgress?: ProgressCallback) {
  const url = appendQueryString(routes.scenarios.download, {
    ids,
    level: 'customer',
  });

  return downloadFile(url, 'scenario-customer-data.csv', onProgress);
}

export function downloadRateCollectionData(id: RatePlan['id'], onProgress?: ProgressCallback) {
  const url = routes.rate_collections.download(id);
  return downloadFile(url, 'rate-collection-data.csv', onProgress);
}

/** ============================ GHG ======================================= */
export async function getGhgRates(options?: GetGHGRatesQueryOptions) {
  const response = await getRequest(routes.ghg_rate, options).then((res) => res.json());

  // Parse the GHG rate results into full-fledged `NavigaderObjects`
  return parsePaginationSet<GetGHGRatesResponse, GHGRate>(response, ({ ghg_rates }) =>
    ghg_rates.map(serializers.parseGHGRate)
  );
}

/** ============================ Procurement =============================== */
export async function getCAISORates(options?: GetCAISORatesQueryOptions) {
  const response = await getRequest(routes.caiso_rate(), options).then((res) => res.json());

  // Parse the CAISO rate results into full-fledged `NavigaderObjects`
  const paginationSet = parsePaginationSet<GetCAISORatesResponse, CAISORate>(
    response,
    ({ caiso_rates }) => caiso_rates.map(serializers.parseCAISORate)
  );

  // Add models to the store and return
  store.dispatch(slices.models.updateModels(paginationSet.data));
  return paginationSet;
}

export async function getCAISORate(id: IdType, options?: GetCAISORatesQueryOptions) {
  const response = await getRequest(routes.caiso_rate(id), options).then((res) => res.json());

  // Parse the GHG rate result into a full-fledged `NavigaderObject`
  return serializers.parseCAISORate({ ...response.caiso_rate, object_type: 'CAISORate' });
}

export function createCAISORate(
  params: CreateCAISORateParams,
  callback: (response: XMLHttpRequest) => void
) {
  const xhr = makeFormXhrPost(routes.caiso_rate(), params);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      callback(xhr);
    }
  };
}

export async function deleteCAISORate(id: IdType) {
  return await deleteRequest(routes.caiso_rate(id));
}

/** ============================ Rate plans ================================ */
export async function getRatePlans(params?: GetRatePlansQueryOptions) {
  const response = await getRequest(routes.rate_plans(), params).then((res) => res.json());

  // Parse the rate plan results into full-fledged `NavigaderObjects`, nesting the rate collections
  // under the plan
  const paginationSet = parsePaginationSet<GetRatePlansResponse, RatePlan>(
    response,
    ({ rate_collections, rate_plans }) =>
      rate_plans.map((ratePlan) => ({
        ...ratePlan,
        rate_collections: omitFalsey(
          (ratePlan.rate_collections || []).map((collectionId) =>
            _.find(rate_collections, { id: collectionId })
          )
        ),

        // This field is included in the `RatePlan` type but not provided by the backend
        object_type: 'RatePlan',
      }))
  );

  // Add models to the store and return
  store.dispatch(slices.models.updateModels(paginationSet.data));
  return paginationSet;
}

export async function getRatePlan(
  id: RatePlan['id'],
  params?: DynamicRestParams<RatePlanIncludeFields>
): Promise<RatePlan> {
  const response: GetRatePlanResponse = await getRequest(
    routes.rate_plans(id),
    params
  ).then((res) => res.json());

  return {
    ...response.rate_plan,
    rate_collections: omitFalsey(response.rate_collections || []),
    object_type: 'RatePlan',
  };
}

export async function createRatePlan(params: CreateRatePlanParams): Promise<RatePlan> {
  const response: CreateRatePlanResponse = await postRequest(
    routes.rate_plans(),
    params
  ).then((res) => res.json());

  return {
    ...response.rate_plan,
    rate_collections: [], // New Rate Plans always have empty rate_collection sets
    object_type: 'RatePlan',
  };
}

export async function deleteRatePlan(id: string) {
  return await deleteRequest(routes.rate_plans(id));
}

/** ============================= Rate Collections ========================= */
export function createRateCollection(
  params: CreateRateCollectionParams,
  callback: (response: XMLHttpRequest) => void
) {
  const xhr = makeFormXhrPost(routes.rate_collections(), params);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      callback(xhr);
    }
  };
}

export async function deleteRateCollection(id: RateCollection['id']) {
  return await deleteRequest(routes.rate_collections(id));
}

/** ============================ System profiles =========================== */
export async function getSystemProfiles(params?: GetSystemProfilesQueryOptions) {
  const response = await getRequest(routes.system_profile(), params).then((res) => res.json());
  const paginationSet = parsePaginationSet<GetSystemProfilesResponse, SystemProfile>(
    response,
    ({ system_profiles }) =>
      system_profiles.map((systemProfile) => ({
        ...serializers.parseSystemProfile(systemProfile),

        // This field is included in the `SystemProfile` type but not provided by the backend
        object_type: 'SystemProfile',
      }))
  );

  // Add models to the store and return
  store.dispatch(slices.models.updateModels(paginationSet.data));
  return paginationSet;
}

export async function getSystemProfile(
  id: SystemProfile['id'],
  params?: GetSystemProfileQueryOptions
): Promise<SystemProfile> {
  const response = await getRequest(routes.system_profile(id), params).then((res) => res.json());

  return serializers.parseSystemProfile({
    ...response.system_profile,
    object_type: 'SystemProfile',
  });
}

export function createSystemProfile(
  params: CreateSystemProfileParams,
  callback: (response: XMLHttpRequest) => void
) {
  const xhr = makeFormXhrPost(routes.system_profile(), params);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      callback(xhr);
    }
  };
}

export async function deleteSystemProfile(id: SystemProfile['id']) {
  return await deleteRequest(routes.system_profile(id));
}

/** ============================ Helpers =================================== */
const baseRoute = (rest: string) => beoRoute.v1(`cost/${rest}`);
const routes = {
  caiso_rate: appendId(baseRoute('caiso_rate')),
  ghg_rate: baseRoute('ghg_rate/'),
  system_profile: appendId(baseRoute('system_profile')),
  scenarios: Object.assign(appendId(baseRoute('scenario')), {
    download: baseRoute('scenario/download/'),
  }),
  rate_plans: appendId(baseRoute('rate_plan')),
  rate_collections: Object.assign(appendId(baseRoute('rate_collection')), {
    download: (id: RatePlan['id']) => routes.rate_collections(id) + 'download/',
  }),
};
