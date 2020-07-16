import {
  BatteryConfiguration, BatteryStrategy, DynamicRestParams, PaginationQueryParams, RawPaginationSet
} from 'navigader/types';
import { appendId, beoRoute, getRequest, parsePaginationSet } from './util';


/** ============================ Types ===================================== */
type DerQueryOptions = PaginationQueryParams & DynamicRestParams;

/** ============================ API Methods =============================== */
export async function getDerConfigurations (queryParams: DerQueryOptions) {
  const response: RawPaginationSet<{ der_configurations: BatteryConfiguration[] }> =
    await getRequest(
      routes.configuration(),
      queryParams
    ).then(res => res.json());
  
  return parsePaginationSet(response, 'der_configurations');
}

export async function getDerStrategies (queryParams: DerQueryOptions) {
  const response: RawPaginationSet<{ der_strategies: BatteryStrategy[] }> =
    await getRequest(
      routes.strategy(),
      queryParams
    ).then(res => res.json());
  
  return parsePaginationSet(response, 'der_strategies');
}

/** ============================ Helpers =================================== */
const baseRoute = (rest: string) => beoRoute.v1(`der/${rest}`);
const routes = {
  configuration: appendId(baseRoute('configuration')),
  simulation: appendId(baseRoute('simulation')),
  strategy: appendId(baseRoute('strategy'))
};
