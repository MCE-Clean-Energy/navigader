import {
  DERConfiguration, DERStrategy, DynamicRestParams, PaginationQueryParams, RawPaginationSet
} from 'navigader/types';
import { appendId, beoRoute, getRequest, parsePaginationSet } from './util';


/** ============================ Types ===================================== */
export type DERQueryParams = PaginationQueryParams & DynamicRestParams;

/** ============================ API Methods =============================== */
export async function getDerConfigurations (queryParams: DERQueryParams) {
  const response: RawPaginationSet<{ der_configurations: DERConfiguration[] }> =
    await getRequest(
      routes.configuration(),
      queryParams
    ).then(res => res.json());

  return parsePaginationSet(response, 'der_configurations');
}

export async function getDerStrategies (queryParams: DERQueryParams) {
  const response: RawPaginationSet<{ der_strategies: DERStrategy[] }> =
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
