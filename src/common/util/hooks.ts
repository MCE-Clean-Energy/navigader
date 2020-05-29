/**
 * Defines custom React hooks for use in the application
 */
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { IdType, ObjectWithId } from 'navigader/types';
import { RootState } from 'navigader/store';
import { _ } from 'navigader/util';
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
