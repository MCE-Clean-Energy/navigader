import { BatteryConfiguration, BatteryStrategy, BatterySimulation } from 'navigader/models/der';
import { LoadType, MeterGroup } from 'navigader/models/meter';
import { _ } from 'navigader/util';
import {
  appendId, beoRoute, DynamicRestParams, equals_, getRequest, PaginationQueryParams,
  parsePaginationSet, RawPaginationSet
} from './util';


/** ============================ Types ===================================== */
type DerQueryOptions = PaginationQueryParams & Partial<DynamicRestParams>;

type DerSimulationQueryOptions = PaginationQueryParams & {
  derConfiguration: BatteryConfiguration['id'];
  derStrategy: BatteryStrategy['id'];
  meterGroup: MeterGroup['id'];
  data_types?: LoadType | LoadType[];
};

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

export async function getDerSimulations (queryOptions: DerSimulationQueryOptions) {
  // Make the request
  const response: RawPaginationSet<{ der_simulations: BatterySimulation[] }> =
    await getRequest(
      routes.simulation(),
      {
        ..._.omit(queryOptions, ['derConfiguration', 'derStrategy', 'meterGroup']),
        filter: {
          der_configuration: equals_(queryOptions.derConfiguration),
          der_strategy: equals_(queryOptions.derStrategy),
          'meter.meter_groups.id': equals_(queryOptions.meterGroup)
        }
      }
    ).then(res => res.json());
  
  return parsePaginationSet(response, 'der_simulations');
}

/** ============================ Helpers =================================== */
const baseRoute = (rest: string) => beoRoute.v1(`der/${rest}`);
const routes = {
  configuration: appendId(baseRoute('configuration')),
  simulation: appendId(baseRoute('simulation')),
  strategy: appendId(baseRoute('strategy'))
};
