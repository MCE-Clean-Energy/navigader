import { useDispatch, useSelector } from 'react-redux';

import * as api from 'navigader/api';
import { slices } from 'navigader/store';
import { Loader, Maybe, MeterGroup, OriginFile, isOriginFile } from 'navigader/types';
import { models } from 'navigader/util/data';
import _ from 'navigader/util/lodash';
import { omitFalsey } from 'navigader/util/omitFalsey';
import { DataTypeFilters } from './types';
import { applyDataFilters, useAsync } from './util';

/**
 * Retrieves a meter group from the store that matches the given ID and data filters, and fetches
 * it from the backend if it's not found in the store.
 *
 * @param {string|undefined} meterGroupId: the ID of the meter group to get. This is allowed to be
 * `undefined` to simplify cases in which the ID may not be ready at component mount time
 * @param {DataTypeFilters} [filters]: any data type filters to apply to the meter group
 */
export function useMeterGroup(meterGroupId: Maybe<string>, filters: DataTypeFilters = {}) {
  const dispatch = useDispatch();

  // Check the store for meter group that matches the provided filters
  const storedMeterGroups = useSelector(slices.models.selectMeterGroups);
  const meterGroup = (() => {
    const meterGroup = _.find(storedMeterGroups, { id: meterGroupId });
    return applyDataFilters(meterGroup, filters) ? meterGroup : undefined;
  })();

  const loading = useAsync(
    async () => {
      // If we've already got the meter group which passes the filters, no need to fetch
      if (!meterGroupId || meterGroup) return;
      return api.getMeterGroup(
        meterGroupId,
        omitFalsey({
          data_types: filters.data_types,
          period: filters.period,
        })
      );
    },
    (meterGroup) => dispatch(slices.models.updateModels([meterGroup])),
    [meterGroupId]
  );

  return { loading, meterGroup };
}

/**
 * Fetches meter groups from the backend given the provided parameters.
 *
 * @param {MeterGroupsQueryParams} params: additional params for querying
 */
export function useMeterGroups(params: api.MeterGroupsQueryParams): Loader<MeterGroup[]> {
  const dispatch = useDispatch();

  // Fetch the meter groups
  const loading = useAsync(
    () => api.getMeterGroups(params),
    ({ data }) => {
      // Continue polling for meter groups that haven't finished ingesting
      models.polling.addMeterGroups(data, params);

      // Add all of them to the store
      dispatch(slices.models.updateModels(data));
    }
  );

  // Return the meter groups in the store
  return Object.assign(useSelector(slices.models.selectMeterGroups), { loading });
}

/** ============================ Origin Files ============================== */
export function useOriginFiles(params: api.MeterGroupsQueryParams): Loader<OriginFile[]> {
  const meterGroups = useMeterGroups({ ...params, object_type: 'OriginFile' });
  return Object.assign(meterGroups.filter(isOriginFile), { loading: meterGroups.loading });
}

export function useOriginFile(...args: Parameters<typeof useMeterGroup>) {
  const { loading, meterGroup } = useMeterGroup(...args);

  if (meterGroup && !isOriginFile(meterGroup)) {
    throw Error(`Meter group with ID "${meterGroup.id}" is not an OriginFile`);
  }

  return { loading, originFile: meterGroup as OriginFile };
}
