import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';

import * as api from 'navigader/api';
import { slices } from 'navigader/store';
import { Loader, Maybe, MeterGroup, OriginFile, isOriginFile } from 'navigader/types';
import { models } from 'navigader/util/data';
import { applyDataFilters, useAsync } from './util';

/**
 * Retrieves a meter group from the store that matches the given ID and data filters, and fetches
 * it from the backend if it's not found in the store.
 *
 * @param {string|undefined} meterGroupId: the ID of the meter group to get. This is allowed to be
 * `undefined` to simplify cases in which the ID may not be ready at component mount time
 * @param {MeterGroupQueryParams} [params]: any data type filters to apply to the meter group
 */
export function useMeterGroup(meterGroupId: Maybe<string>, params: api.MeterGroupQueryParams = {}) {
  const dispatch = useDispatch();

  // Check the store for meter group that matches the provided filters
  const storedMeterGroups = useSelector(slices.models.selectMeterGroups);
  const meterGroup = (() => {
    const meterGroup = _.find(storedMeterGroups, { id: meterGroupId });
    if (!meterGroup) return;

    // Check if meter group meets filters
    const matchesDataTypes = applyDataFilters(meterGroup, params);
    const matchesFilters = applyMeterGroupDynamicRestFilters(meterGroup, params);
    return matchesDataTypes && matchesFilters ? meterGroup : undefined;
  })();

  const loading = useAsync(
    async () => {
      // If we've already got the meter group which passes the filters, no need to fetch
      if (!meterGroupId || meterGroup) return;
      return api.getMeterGroup(meterGroupId, params);
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

/**
 * Applies meter group-specific dynamic rest filters to a meter group, returning `true` if the meter
 * group meets all of the filters and `false` if any do not pass.
 *
 * @param {MeterGroup} meterGroup: the meter group to apply the filters to
 * @param {MeterGroupQueryParams} [params]: the meter group-specific dynamic rest params to apply
 */
function applyMeterGroupDynamicRestFilters(
  meterGroup: MeterGroup,
  params?: api.MeterGroupQueryParams
) {
  if (!params?.include) return true;
  const includeParams = typeof params.include === 'string' ? [params.include] : params.include;
  return _.every(includeParams, (param) => {
    switch (param) {
      case 'total_therms':
        // Only applies to origin files. If `total_therms` is undefined and `has_gas` is falsey,
        // we return `true` because we can be certain there's nothing to gain from re-querying.
        if (isOriginFile(meterGroup) && meterGroup.has_gas) {
          return !_.isUndefined(meterGroup.total_therms);
        } else {
          return true;
        }
    }
  });
}
