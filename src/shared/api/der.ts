import { appendId, getRequest, parsePaginationSet } from '@nav/shared/api/util';
import { BatteryConfiguration, BatteryStrategy } from '@nav/shared/models/der';
import { PaginationQueryParams, PaginationSet, PaginationSetRaw } from '@nav/shared/types';


/** ============================ Types ===================================== */
type DerConfigurationQueryParams = Partial<PaginationQueryParams & { data: boolean; }>;

/** ============================ API Methods =============================== */
export async function getDerConfigurations (
  queryParams?: DerConfigurationQueryParams
): Promise<PaginationSet<BatteryConfiguration>> {
  const response: PaginationSetRaw<BatteryConfiguration> =
    await getRequest(
      routes.configuration(),
      makeQueryParams(queryParams)
    ).then(res => res.json());
  
  return parsePaginationSet(response);
}

export async function getDerStrategies (
  queryParams?: DerConfigurationQueryParams
): Promise<PaginationSet<BatteryStrategy>> {
  const response: PaginationSetRaw<BatteryStrategy> =
    await getRequest(
      routes.strategy(),
      makeQueryParams(queryParams)
    ).then(res => res.json());
  
  return parsePaginationSet(response);
}

/** ============================ Helpers =================================== */
const baseRoute = (rest: string) => `${process.env.REACT_APP_BEO_URI}/v1/der/${rest}`;
const routes = {
  configuration: appendId(baseRoute('configuration')),
  simulation: appendId(baseRoute('simulation')),
  strategy: appendId(baseRoute('strategy'))
};

function makeQueryParams (queryParams?: DerConfigurationQueryParams) {
  if (!queryParams) return null;
  return {
    data: queryParams.data,
    page: queryParams.page,
    page_size: queryParams.pageSize
  };
}
