/**
 * Defines custom React hooks for use in the application
 */
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import * as api from 'navigader/api';
import { poller } from 'navigader/models/common';
import { RootState, slices } from 'navigader/store';
import { ColorMap } from 'navigader/styles';
import {
  GHGRate, IdType, ObjectWithId, PaginationSet, Scenario, CAISORate, DataTypeParams
} from 'navigader/types';
import { makeCancelableAsync } from 'navigader/util';
import _ from 'navigader/util/lodash';
import { omitFalsey } from '../omitFalsey';


/** ============================ Types ===================================== */
type DataTypeFilters = Pick<DataTypeParams, 'data_types' | 'period'>;
type CAISORateFilters = DataTypeFilters & { year: number; }

/** ============================ Hooks ===================================== */
/**
 * A custom hook that builds on `useLocation` to parse the query string. Note that `URLSearchParams`
 * is not supported by Internet Explorer (eye roll...) but there is a polyfill included from the
 * application entrypoint.
 *
 * * @param {string[]} params: the names of the query parameters of interest
 */
export function useQueryParams (params: string[]): Array<string | null> {
  const urlSearchParams = new URLSearchParams(useLocation().search);
  return params.map(param => urlSearchParams.get(param))
}

/**
 * Loads table data from the store given a selector function to access the slice where the data
 * is stored and a list of IDs of the data to return. The returned data will be ordered the same
 * as the IDs
 *
 * @param {(state: RootState) => ObjectWithId[]} dataSelector: selector function that retrieves all
 *   data from the store slice
 * @param {IdType[]} ids: ordered array of IDs to filter for
 */
export function useTableSelector <Datum extends ObjectWithId>(
  dataSelector: (state: RootState) => Datum[],
  ids: IdType[] | null
): Datum[] {
  const allData = useSelector(dataSelector);

  if (ids === null) return [];

  // TODO: the property shorthand `_.find(allData, { id })` is preferable and should work-- I'm
  //  confused why it doesn't
  return omitFalsey(ids.map((id) => _.find(allData, ['id', id])));
}

/**
 * Creates a color map, resetting it whenever the dependencies change
 *
 * @param {any[]} dependencies: the dependencies upon which the color map depends
 * @param {any[]} [initialElements]: initial elements to populate the map with
 */
export function useColorMap (dependencies: any[], initialElements?: any[]) {
  const [colorMap, setColorMap] = React.useState(new ColorMap(initialElements));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => setColorMap(new ColorMap(initialElements)), dependencies);
  return colorMap;
}

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
