import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';

import * as api from 'navigader/api';
import { slices } from 'navigader/store';
import {
  CAISORate,
  CostFunctions,
  GHGRate,
  Loader,
  Maybe,
  RatePlan,
  SystemProfile,
} from 'navigader/types';
import { omitFalsey } from 'navigader/util/omitFalsey';
import { DataTypeFilters } from './types';
import { applyDataFilters, useAsync } from './util';

/** ============================ Types ===================================== */
type UseCostFunctionsParams = Partial<{
  ratePlans: Partial<api.GetRatePlansQueryOptions>;
  caisoRates: DataTypeFilters;
}>;

type CostFunctionLoaders = { [CF in keyof CostFunctions]: Loader<CostFunctions[CF][]> };

/** ============================ Rate plans ================================ */
/**
 * Loads the rate plans if they haven't been loaded already. Once loaded they will be added to the
 * store
 */
export function useRatePlans(params?: api.GetRatePlansQueryOptions): Loader<RatePlan[]> {
  const ratePlans = useSelector(slices.models.selectRatePlans);
  const loading = useAsync(async () => api.getRatePlans(params));
  return Object.assign([...ratePlans], { loading });
}

export function useRatePlan(ratePlanId: RatePlan['id'], params?: api.GetRatePlanQueryOptions) {
  const dispatch = useDispatch();

  const storedRatePlans = useSelector(slices.models.selectRatePlans);
  const ratePlan = _.find(storedRatePlans, { id: ratePlanId });

  const loading = useAsync(
    async () => {
      return api.getRatePlan(ratePlanId, params);
    },
    (ratePlan) => dispatch(slices.models.updateModel(ratePlan)),
    [ratePlanId]
  );

  return { loading, ratePlan };
}

/** ============================ GHG Rates ================================= */
/**
 * Loads the GHG rates if they haven't been loaded already. Once loaded they will be added to
 * the store
 */
export function useGhgRates(): Loader<GHGRate[]> {
  const dispatch = useDispatch();
  const ghgRates = useSelector(slices.models.selectGHGRates);

  const loading = useAsync(
    async () => {
      // If we've already loaded the rates, we don't need to do so again
      if (ghgRates.length) return;
      return api.getGhgRates({
        data_format: '288',
        include: ['data'],
        page: 0,
        pageSize: 100,
      });
    },
    ({ data }) => dispatch(slices.models.updateModels(data))
  );

  return Object.assign([...ghgRates], { loading });
}

/**
 * Loads a single GHG rate if they haven't been loaded already. Once loaded they will be added to
 * the store
 */
export function useGhgRate(id: GHGRate['id']) {
  const ghgRates = useSelector(slices.models.selectGHGRates);
  const ghgRate = _.find(ghgRates, { id });

  useAsync(async () => {
    // If we've already loaded the rate, we don't need to do so again
    if (ghgRate) return;
    return api.getGhgRate(id, {
      data_format: '288',
      include: ['data'],
    });
  });

  return ghgRate;
}

/** ============================ CAISO Rates =============================== */
/**
 * Loads the CAISO rates if they haven't been loaded already. Once loaded they will be added to
 * the store
 */
export function useCAISORates(filters: DataTypeFilters = {}): Loader<CAISORate[]> {
  const dispatch = useDispatch();

  // Check the store for CAISO rates that match the provided filters
  const storedCAISORates = useSelector(slices.models.selectCAISORates);
  const caisoRates = storedCAISORates.filter((caisoRate) => applyDataFilters(caisoRate, filters));

  const loading = useAsync(
    async () => {
      // If we've already loaded the rates, we don't need to do so again
      if (caisoRates.length) return;
      return api.getCAISORates({
        ...omitFalsey({
          data_types: filters.data_types,
          period: filters.period,
        }),
        page: 0,
        pageSize: 100,
      });
    },
    ({ data }) => dispatch(slices.models.updateModels(data))
  );

  return Object.assign([...caisoRates], { loading });
}

export function useCAISORate(
  caisoRateId: CAISORate['id'],
  filters: DataTypeFilters = {}
): Maybe<CAISORate> {
  const dispatch = useDispatch();

  // Check the store for CAISO rates that match the provided filters
  const storedCAISORates = useSelector(slices.models.selectCAISORates);
  const caisoRate = _.find(storedCAISORates, { id: caisoRateId });

  useAsync(
    async () => {
      // If we've already loaded the rates, we don't need to do so again
      if (caisoRate) return;
      return api.getCAISORate(caisoRateId, {
        ...omitFalsey({
          data_types: filters.data_types,
          period: filters.period,
        }),
        page: 0,
        pageSize: 100,
      });
    },
    (data) => dispatch(slices.models.updateModel(data))
  );

  return caisoRate;
}

/** ============================ System profiles =========================== */
export function useSystemProfiles(filters?: DataTypeFilters): Loader<SystemProfile[]> {
  const dispatch = useDispatch();
  const systemProfiles = useSelector(slices.models.selectSystemProfiles);

  const loading = useAsync(
    async () =>
      api.getSystemProfiles({
        ...filters,
        page: 0,
        pageSize: 100,
      }),
    ({ data }) => dispatch(slices.models.updateModels(data))
  );

  return Object.assign([...systemProfiles], { loading });
}

export function useSystemProfile(systemProfileId: SystemProfile['id'], filters?: DataTypeFilters) {
  const dispatch = useDispatch();
  const storedSystemProfiles = useSelector(slices.models.selectSystemProfiles);
  const systemProfile = _.find(storedSystemProfiles, { id: systemProfileId });

  const loading = useAsync(
    async () => {
      if (systemProfile) return;
      return api.getSystemProfile(systemProfileId, { ...filters });
    },
    (systemProfile) => dispatch(slices.models.updateModel(systemProfile)),
    [systemProfileId]
  );
  return { loading, systemProfile };
}

/** ============================ Everything ================================ */
/**
 * This is a convenience hook for accessing all kinds of cost functions. In an ideal world there
 * would be a single endpoint for loading them all. In the actual world there isn't, so this call
 * will make multiple API calls, one per cost function category.
 */
export function useCostFunctions(params?: UseCostFunctionsParams): CostFunctionLoaders {
  return {
    ghgRate: useGhgRates(),
    caisoRate: useCAISORates(params?.caisoRates),
    ratePlan: useRatePlans({ ...params?.ratePlans, page: 0, pageSize: 100 }),
    systemProfile: useSystemProfiles(),
  };
}
