import {
  DataTypeParams, DynamicRestParams, MeterGroup, PaginationQueryParams, RawMeter, RawMeterGroup,
  RawPaginationSet
} from 'navigader/types';
import { filterClause, serializers } from 'navigader/util';
import _ from 'navigader/util/lodash';
import { appendId, beoRoute, getRequest, makeFormXhrPost, parsePaginationSet } from './util';


/** ============================ Types ===================================== */
/** Query params */
type MeterQueryParams = PaginationQueryParams & DataTypeParams & {
  meterGroupId: MeterGroup['id'];
};

type MeterGroupQueryParams = DynamicRestParams<'meters'> & DataTypeParams;
export type MeterGroupsQueryParams = MeterGroupQueryParams & PaginationQueryParams;

/** Responses */
type GetMeterGroupsResponse = { meter_groups: RawMeterGroup[] };
type GetMeterGroupResponse = { meter_group: RawMeterGroup };

/** ============================ API Methods =============================== */
export async function getMeterGroups (queryParams: MeterGroupsQueryParams) {
  const response: RawPaginationSet<GetMeterGroupsResponse> =
    await getRequest(
      routes.meterGroup(),
      queryParams
    ).then(res => res.json());

  return parsePaginationSet(
    response,
    ({ meter_groups }) => meter_groups.map(serializers.parseMeterGroup)
  );
}

export async function getMeterGroup (
  uuid: string,
  queryParams?: MeterGroupQueryParams
) {
  const response: GetMeterGroupResponse =
    await getRequest(
      routes.meterGroup(uuid),
      queryParams
    ).then(res => res.json());

  // Parse the meter group results
  return serializers.parseMeterGroup(response.meter_group);
}

export function postOriginFile (file: File, name: string) {
  return makeFormXhrPost(routes.originFile, { file, name });
}

export async function getMeters (queryParams: MeterQueryParams) {
  const response: RawPaginationSet<{ meters: RawMeter[] }> =
    await getRequest(
      routes.meter(),
      {
        ..._.omit(queryParams, 'meterGroupId'),
        filter: {
          meter_groups: filterClause.equals(queryParams.meterGroupId)
        }
      }
    ).then(res => res.json());

  // Parse the meter results
  return parsePaginationSet(response, ({ meters }) => meters.map(serializers.parseMeter));
}

/** ============================ Helpers =================================== */
const baseRoute = (rest: string) => beoRoute.v1(`load/${rest}`);
const routes = {
  meter: appendId(baseRoute('meter')),
  meterGroup: appendId(baseRoute('meter_group')),
  originFile: baseRoute('origin_file/')
};
