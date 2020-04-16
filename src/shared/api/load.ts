import { LoadType, parseMeterGroup, Meter, MeterGroup } from '@nav/shared/models/meter';
import {
  appendId, beoRoute, getRequest, makeFormPost, parsePaginationSet, PaginationQueryParams,
  PaginationSet, RawPaginationSet, equals_
} from './util';


/** ============================ Types ===================================== */
type MeterQueryParams = Partial<PaginationQueryParams & {
  data_types: LoadType | LoadType[];
  meterGroupId: MeterGroup['id'];
}>;

type MeterGroupQueryParams = Omit<MeterQueryParams, 'meterGroupId'>;

/** ============================ API Methods =============================== */
export async function getMeterGroups (
  queryParams?: MeterGroupQueryParams
): Promise<PaginationSet<MeterGroup>> {
  const response: RawPaginationSet<{ meter_groups: MeterGroup[] }> =
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
      {
        ...queryParams,
        filter: {
          meter_groups: equals_(queryParams?.meterGroupId)
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
