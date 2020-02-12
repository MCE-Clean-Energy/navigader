import { LoadType, parseMeter, RawMeter } from '../models/meter';
import { MeterGroup, RawMeterGroup, parseMeterGroup } from '../models/meter';
import { PaginationSet } from '../types';
import { appendId, getRequest } from './util';


/** ============================ Types ===================================== */
type MeterQueryParams = Partial<{
  end: Date;
  meterGroupId: MeterGroup['id'];
  start: Date;
  types: LoadType | LoadType[];
}>;

type MeterGroupQueryParams = Omit<MeterQueryParams, 'meterGroupId'>;

/** ============================ API Methods =============================== */
export async function getMeterGroups (
  queryParams?: MeterGroupQueryParams
): Promise<PaginationSet<MeterGroup>> {
  const response: PaginationSet<RawMeterGroup> =
    await getRequest(
      routes.meterGroup(),
      makeQueryParams(queryParams)
    ).then(res => res.json());
  
  // Parse the meter group results
  return {
    ...response,
    results: response.results.map(parseMeterGroup)
  };
}

export async function getMeterGroup (
  uuid: string,
  queryParams?: MeterGroupQueryParams
) {
  const response: RawMeterGroup =
    await getRequest(
      routes.meterGroup(uuid),
      makeQueryParams(queryParams)
    ).then(res => res.json());
  
  // Parse the meter group results
  return parseMeterGroup(response);
}

export async function getMeter (id: string, queryParams?: MeterQueryParams) {
  const response: RawMeter =
    await getRequest(
      routes.meter(id),
      makeQueryParams(queryParams)
    ).then(res => res.json());
  
  // Parse the meter results
  return parseMeter(response);
}

export async function getMeters (queryParams?: MeterQueryParams) {
  const response: PaginationSet<RawMeter> =
    await getRequest(
      routes.meter(),
      makeQueryParams(queryParams)
    ).then(res => res.json());
  
  // Parse the meter results
  return response.results.map(parseMeter);
}

/** ============================ Helpers =================================== */
const baseRoute = (rest: string) => `/beo/v1/load/${rest}`;
const routes = {
  meter: appendId(baseRoute('meter')),
  meterGroup: appendId(baseRoute('meter_group'))
};

function makeQueryParams (queryParams?: MeterQueryParams) {
  if (!queryParams) return null;
  return {
    data_types: queryParams.types,
    end_limit: queryParams.end,
    meter_groups: queryParams.meterGroupId,
    start: queryParams.start
  };
}
