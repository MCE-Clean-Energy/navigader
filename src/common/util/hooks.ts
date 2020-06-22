/**
 * Defines custom React hooks for use in the application
 */
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import * as api from 'navigader/api';
import { IdType, ObjectWithId } from 'navigader/types';
import { RootState, slices } from 'navigader/store';
import { ColorMap } from 'navigader/styles';
import { makeCancelableAsync } from 'navigader/util';
import _ from 'navigader/util/lodash';
import { omitFalsey } from './omitFalsey';


/**
 * A custom hook that builds on `useLocation` to parse the query string. Note that `URLSearchParams`
 * is not supported by Internet Explorer (eye roll...) but there is a polyfill included from the
 * application entrypoint.
 */
export function useQuery() {
  return new URLSearchParams(useLocation().search);
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
  const storedGhgRates = useSelector(slices.models.selectGhgRates);
  const [ghgRates, setGhgRates] = React.useState(
    storedGhgRates.length ? storedGhgRates : undefined
  );
  
  // Make an API call if we don't have the GHG rates loaded yet
  React.useEffect(
    makeCancelableAsync(
      async () => {
        if (ghgRates) return ghgRates;
        
        // Request the GHG rates and save them to the store
        const fetchedRates = (await api.getGhgRates({
          data_format: '288',
          include: ['data'],
          page: 1,
          page_size: 100
        })).data;

        dispatch(slices.models.updateModels(fetchedRates));
        return fetchedRates;
      },
      setGhgRates
    ),
    []
  );
  
  return ghgRates;
}
