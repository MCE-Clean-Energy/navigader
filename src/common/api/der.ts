import {
  BatteryConfiguration,
  BatteryStrategy,
  CostFunction,
  DERConfiguration,
  DERStrategy,
  DERType,
  DynamicRestParams,
  EVSEConfiguration,
  EVSEStrategy,
  PaginationQueryParams,
  RawPaginationSet,
  SolarConfiguration,
  SolarStrategy,
} from 'navigader/types';
import { appendId, beoRoute, getRequest, parsePaginationSet, postRequest } from './util';

/** ============================ Types ===================================== */
export type DERQueryParams = PaginationQueryParams &
  DynamicRestParams<'data'> & { der_type?: DERType };

type CreateDERCommonParams<DERObject extends DERConfiguration | DERStrategy> = {
  name: string;
  der_type: DERObject['der_type'];
};

// Configurations
type CreateDERConfigurationCommonParams<
  Configuration extends DERConfiguration
> = CreateDERCommonParams<Configuration> & Configuration['data'];

type CreateBatteryConfigurationParams = CreateDERConfigurationCommonParams<BatteryConfiguration>;
type CreateEVSEConfigurationParams = CreateDERConfigurationCommonParams<EVSEConfiguration>;
type CreateSolarConfigurationParams = CreateDERConfigurationCommonParams<SolarConfiguration>;
export type CreateDERConfigurationParams =
  | CreateBatteryConfigurationParams
  | CreateEVSEConfigurationParams
  | CreateSolarConfigurationParams;

// Strategies
type CreateBatteryStrategyParams = CreateDERCommonParams<BatteryStrategy> & {
  charge_from_grid: boolean;
  cost_function: Pick<CostFunction, 'id' | 'object_type'>;
  description?: string;
  discharge_to_grid: boolean;
};
type CreateSolarStrategyParams = CreateDERCommonParams<SolarStrategy> & {
  serviceable_load_ratio: number;
};
type CreateEVSEStrategyParams = CreateDERCommonParams<EVSEStrategy>;
export type CreateDERStrategyParams =
  | CreateBatteryStrategyParams
  | CreateEVSEStrategyParams
  | CreateSolarStrategyParams;

/** ============================ API Methods =============================== */
export async function createDERConfiguration(params: CreateDERConfigurationParams) {
  return await postRequest(routes.configuration(), params);
}

export async function createDERStrategy(params: CreateDERStrategyParams) {
  return await postRequest(routes.strategy(), params);
}

export async function getDerConfigurations<T extends DERConfiguration>(
  queryParams: DERQueryParams
) {
  const response: RawPaginationSet<{ der_configurations: T[] }> = await getRequest(
    routes.configuration(),
    queryParams
  ).then((res) => res.json());

  return parsePaginationSet(response, 'der_configurations');
}

export async function getDerStrategies<T extends DERStrategy>(queryParams: DERQueryParams) {
  const response: RawPaginationSet<{ der_strategies: T[] }> = await getRequest(
    routes.strategy(),
    queryParams
  ).then((res) => res.json());

  return parsePaginationSet(response, 'der_strategies');
}

/** ============================ Helpers =================================== */
const baseRoute = (rest: string) => beoRoute.v1(`der/${rest}`);
const routes = {
  configuration: appendId(baseRoute('configuration')),
  simulation: appendId(baseRoute('simulation')),
  strategy: appendId(baseRoute('strategy')),
};
