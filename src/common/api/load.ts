import {
  LoadType, Meter, MeterGroup, PaginationQueryParams, RawMeterGroup, RawPaginationSet
} from 'navigader/types'
import _ from 'navigader/util/lodash';
import {
  appendId, beoRoute, equals_, getRequest, makeFormXhrPost, parseMeterGroup, parsePaginationSet
} from './util';


/** ============================ Types ===================================== */
type MeterQueryParams = PaginationQueryParams & {
  meterGroupId: MeterGroup['id'];
};

type MeterGroupQueryParams = { data_types?: LoadType | LoadType[]; };
type MeterGroupsQueryParams = PaginationQueryParams & MeterGroupQueryParams;

/** ============================ API Methods =============================== */
export async function getMeterGroups (queryParams: MeterGroupsQueryParams) {
  const response: RawPaginationSet<{ meter_groups: RawMeterGroup[] }> =
    await getRequest(
      routes.meterGroup(),
      queryParams
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
  const response: Record<'meter_group', MeterGroup> =
    await getRequest(
      routes.meterGroup(uuid),
      queryParams
    ).then(res => res.json());
  
  // Parse the meter group results
  return parseMeterGroup(response.meter_group);
}

export function postOriginFile (file: File, name: string) {
  return makeFormXhrPost(routes.originFile, { file, name });
}

export async function getMeters (queryParams: MeterQueryParams) {
  const response: RawPaginationSet<{ meters: Meter[] }> =
    await getRequest(
      routes.meter(),
      {
        ..._.omit(queryParams, 'meterGroupId'),
        filter: {
          meter_groups: equals_(queryParams.meterGroupId)
        }
      }
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
