import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as api from 'navigader/api';
import { poller } from 'navigader/models/common';
import { slices } from 'navigader/store';
import { CAISORate, DataTypeParams, GHGRate, PaginationSet, Scenario } from 'navigader/types';
import { makeCancelableAsync, omitFalsey } from 'navigader/util';
import _ from 'navigader/util/lodash';


/** ============================ Types ===================================== */
type DataTypeFilters = Pick<DataTypeParams, 'data_types' | 'period'>;
type CAISORateFilters = DataTypeFilters & { year: number; };

/** ============================ Hooks ===================================== */
/**
 * Loads the GHG rates if they haven't been loaded already. Once loaded they will be added to
 * the store
 */
export function useGhgRates () {
  const dispatch = useDispatch();
  const storedGhgRates = useSelector(slices.models.selectGHGRates);
  const [ghgRates, setGhgRates] = React.useState(
    storedGhgRates.length ? storedGhgRates : undefined
  );

  useAsync(
    () => api.getGhgRates({
      data_format: '288',
      include: ['data'],
      page: 1,
      page_size: 100
    }),
    handleGhgRatesRequest,
    [],
    // If we've already loaded the rates, we don't need to do so again
    () => !ghgRates
  );

  return ghgRates;

  /**
   * Handles the API response. The models will be added to the store.
   *
   * @param {PaginationSet<GHGRate>} ghgRates: the API response
   */
  function handleGhgRatesRequest ({ data }: PaginationSet<GHGRate>) {
    dispatch(slices.models.updateModels(data));
    setGhgRates(data);
  }
}

/**
 * Loads the CAISO rates if they haven't been loaded already. Once loaded they will be added to
 * the store
 */
export function useCAISORates (filters: Partial<CAISORateFilters> = {}) {
  const dispatch = useDispatch();

  // Check the store for CAISO rates that match the provided filters
  const storedCAISORates = useSelector(slices.models.selectCAISORates);
  const caisoRates = storedCAISORates.filter((caisoRate) => {
    if (filters.year && caisoRate.year !== filters.year) return false;
    if (filters.data_types) {
      const typesNeeded = _.isArray(filters.data_types) ? filters.data_types : [filters.data_types];
      const typesPresent = Object.keys(caisoRate.data);
      if (!_.every(typesNeeded.map(type => typesPresent.includes(type)))) {
        return false;
      }
    }
    if (filters.period) {
      const intervalData = caisoRate.data.default;
      if (!intervalData) return false;
      if (intervalData.period !== filters.period) return false;
    }
    return true;
  });

  useAsync(
    () => api.getCAISORates({
      ...omitFalsey({
        data_types: filters.data_types,
        period: filters.period
      }),
      page: 1,
      page_size: 100
    }),
    handleCAISORatesRequest,
    [],
    // If we've already loaded the rates, we don't need to do so again
    () => !caisoRates.length
  );

  // If we don't yet have the CAISO rates (or if filters were provided that don't match any existing
  // CAISO rates) return undefined
  return caisoRates.length ? caisoRates : undefined;

  /**
   * Handles the API response. The models will be added to the store.
   *
   * @param {PaginationSet<GHGRate>} ghgRates: the API response
   */
  function handleCAISORatesRequest ({ data }: PaginationSet<CAISORate>) {
    dispatch(slices.models.updateModels(data));
  }
}

/**
 * Loads a scenario given its ID and options for querying
 *
 * @param {string} scenarioId: the ID of the scenario to get
 * @param {GetScenarioQueryOptions} [options]: additional options for querying
 */
export function useScenario (scenarioId: string, options?: api.GetScenarioQueryOptions) {
  const [scenario, setScenario] = React.useState<Scenario>();
  const loading = useAsync(() => api.getScenario(scenarioId, options), setScenario, [scenarioId]);
  return { scenario, loading };
}

export function useMeterGroups (options: api.MeterGroupsQueryParams) {
  const dispatch = useDispatch();

  // Fetch the meter groups
  const loading = useAsync(
    () => api.getMeterGroups(options),
    ({ data }) => {
      // Continue polling for meter groups that haven't finished ingesting
      poller.addMeterGroups(data, options);

      // Add all of them to the store
      dispatch(slices.models.updateModels(data))
    },
    []
  );

  // Return the meter groups in the store
  return { loading, meterGroups: useSelector(slices.models.selectMeterGroups) };
}

/**
 * Loads DER strategies
 */
export function useDERStrategies (options: api.DERQueryParams) {
  const dispatch = useDispatch();

  // Fetch the meter groups
  const loading = useAsync(
    () => api.getDerStrategies(options),
    ({ data }) => dispatch(slices.models.updateModels(data)),
    []
  );

  // Return the meter groups in the store
  return { loading, derStrategies: useSelector(slices.models.selectDERStrategies) };
}

/**
 * Loads DER configurations
 */
export function useDERConfigurations (options: api.DERQueryParams) {
  const dispatch = useDispatch();

  // Fetch the meter groups
  const loading = useAsync(
    () => api.getDerConfigurations(options),
    ({ data }) => dispatch(slices.models.updateModels(data)),
    []
  );

  // Return the meter groups in the store
  return { loading, derConfigurations: useSelector(slices.models.selectDERConfigurations) };
}

/**
 * Hook for calling an asynchronous method
 *
 * @param {function} fn: the asynchronous function to call
 * @param {function} callback: a callback to execute once the function has completed
 * @param {any[]} dependencies: the dependency array
 * @param {function} [condition]: a conditional function. If this returns `false` the async function
 *   will not be executed
 */
function useAsync <T>(
  fn: () => Promise<T>,
  callback: (response: T) => void,
  dependencies: any[],
  condition?: () => boolean
) {
  const [loading, setLoading] = React.useState(false);

  React.useEffect(
    makeCancelableAsync(
      async () => {
        // If the condition for making the request is not met, or if another request is already
        // underway, return
        if (loading) return;
        if (condition && !condition()) return;
        setLoading(true);
        return fn();
      },
      res => {
        setLoading(false);
        res && callback(res);
      }
    ),
    dependencies
  );

  return loading;
}
