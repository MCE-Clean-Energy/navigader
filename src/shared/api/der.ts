import {
  appendId, beoRoute, getRequest, makePaginationQueryParams, parsePaginationSet
} from '@nav/shared/api/util';
import { BatteryConfiguration, BatteryStrategy } from '@nav/shared/models/der';
import {
  DynamicRestParams, PaginationQueryParams, PaginationSet, RawPaginationSet
} from '@nav/shared/types';


/** ============================ Types ===================================== */
type DerQueryParams = Partial<PaginationQueryParams & DynamicRestParams>;

/** ============================ API Methods =============================== */
export async function getDerConfigurations (
  queryParams?: DerQueryParams
): Promise<PaginationSet<BatteryConfiguration>> {
  const response: RawPaginationSet<{ der_configurations: BatteryConfiguration[] }> =
    await getRequest(
      routes.configuration(),
      makeQueryParams(queryParams)
    ).then(res => res.json());
  
  return parsePaginationSet(response, 'der_configurations');
}

export async function getDerStrategies (
  queryParams?: DerQueryParams
): Promise<PaginationSet<BatteryStrategy>> {
  const response: RawPaginationSet<{ der_strategies: BatteryStrategy[] }> =
    await getRequest(
      routes.strategy(),
      makeQueryParams(queryParams)
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

function makeQueryParams (queryParams?: DerQueryParams) {
  if (!queryParams) return;
  return {
    ...makePaginationQueryParams(queryParams),
    include: queryParams.include
  };
}
