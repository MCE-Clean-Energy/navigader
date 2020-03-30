import {
  appendId, beoRoute, getRequest, parsePaginationSet, makeFormPost, makePaginationQueryParams
} from '@nav/shared/api/util';
import {
  LoadType, MeterGroup, parseMeterGroup, Meter, RawMeterGroup
} from '@nav/shared/models/meter';
import { PaginationQueryParams, PaginationSet, RawPaginationSet } from '@nav/shared/types';


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
  const response: RawPaginationSet<{ meter_groups: RawMeterGroup[] }> =
    await getRequest(
      routes.meterGroup(),
      makeQueryParams(queryParams)
    ).then(res => res.json());
  
  return parsePaginationSet(
    response,
    ({ meter_groups }) => meter_groups.map(parseMeterGroup)
  );
}

export async function getMeterGroup (
  uuid: string,
  queryParams?: MeterGroupQueryParams
) {
  const response: Record<'meter_group', RawMeterGroup> =
    await getRequest(
      routes.meterGroup(uuid),
      makeQueryParams(queryParams)
    ).then(res => res.json());
  
  // Parse the meter group results
  return parseMeterGroup(response.meter_group);
}

export async function postOriginFile (file: File, name: string) {
  return await makeFormPost(
    routes.originFile,
    {
      file,
      name
    }
  );
}

export async function getMeters (
  queryParams?: MeterQueryParams
): Promise<PaginationSet<Meter>> {
  const response: RawPaginationSet<{ meters: Meter[] }> =
    await getRequest(
      routes.meter(),
      makeQueryParams(queryParams)
    ).then(res => res.json());
  
  // Parse the meter results
  return parsePaginationSet(response, 'meters');
}

/** ============================ Helpers =================================== */
const baseRoute = (rest: string) => beoRoute.v1(`load/${rest}`);
const routes = {
  meter: appendId(baseRoute('meter')),
  meterGroup: appendId(baseRoute('meter_group')),
  originFile: baseRoute('origin_file/')
};

function makeQueryParams (queryParams?: MeterQueryParams) {
  if (!queryParams) return;
  return {
    ...makePaginationQueryParams(queryParams),
    data_types: queryParams.types,
    end_limit: queryParams.end,
    filter: { meter_groups: queryParams.meterGroupId },
    start: queryParams.start
  };
}
