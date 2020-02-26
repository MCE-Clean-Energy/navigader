import {
  LoadType,
  Meter,
  MeterGroup,
  parseMeter,
  parseMeterGroup,
  RawMeter,
  RawMeterGroup
} from '@nav/shared/models/meter';
import { PaginationSet, PaginationSetRaw, RowsPerPageOption } from '@nav/shared/types';
import { appendId, getRequest, parsePaginationSet } from '@nav/shared/api/util';


/** ============================ Types ===================================== */
type MeterQueryParams = Partial<{
  end: Date;
  meterGroupId: MeterGroup['id'];
  page: number;
  pageSize: RowsPerPageOption,
  start: Date;
  types: LoadType | LoadType[];
}>;

type MeterGroupQueryParams = Omit<MeterQueryParams, 'meterGroupId'>;

/** ============================ API Methods =============================== */
export async function getMeterGroups (
  queryParams?: MeterGroupQueryParams
): Promise<PaginationSet<MeterGroup>> {
  const response: PaginationSetRaw<RawMeterGroup> =
    await getRequest(
      routes.meterGroup(),
      makeQueryParams(queryParams)
    ).then(res => res.json());
  
  return parsePaginationSet(response, parseMeterGroup);
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

export async function getMeters (
  queryParams?: MeterQueryParams
): Promise<PaginationSet<Meter>> {
  const response: PaginationSetRaw<RawMeter> =
    await getRequest(
      routes.meter(),
      makeQueryParams(queryParams)
    ).then(res => res.json());
  
  // Parse the meter results
  return parsePaginationSet(response, parseMeter);
}

/** ============================ Helpers =================================== */
const baseRoute = (rest: string) => `${process.env.REACT_APP_BEO_URI}/v1/load/${rest}`;
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
    page: queryParams.page,
    page_size: queryParams.pageSize,
    start: queryParams.start
  };
}
