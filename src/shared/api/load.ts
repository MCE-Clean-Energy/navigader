import {
  appendId, getRequest, parsePaginationSet, makeFormPost,
} from '@nav/shared/api/util';
import {
  LoadType, Meter, MeterGroup, parseMeter, parseMeterGroup, RawMeter, RawMeterGroup
} from '@nav/shared/models/meter';
import { PaginationQueryParams, PaginationSet, PaginationSetRaw } from '@nav/shared/types';


/** ============================ Types ===================================== */
type MeterQueryParams = Partial<PaginationQueryParams & {
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

export async function postOriginFile (
  file: File,
  name: string
) {
  // TODO: Provide the correct LSE ID
  return await makeFormPost(
    routes.originFile,
    {
      file,
      name,
      load_serving_entity_id: 1
    }
  );
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
  meterGroup: appendId(baseRoute('meter_group')),
  originFile: baseRoute('origin_file/')
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
