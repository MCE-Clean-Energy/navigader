import { useSelector } from 'react-redux';
import find from 'lodash/find';

import { IdType, ObjectWithId } from '@nav/shared/types';
import { omitFalsey } from '@nav/shared/util';
import * as slices from './slices';
import { RootState } from './types';


export { default } from './store';
export * from './types';
export { slices };

/**
 * Custom React hook that loads table data from the store given a selector function to access the
 * slice where the data is stored and a list of IDs of the data to return. The returned data will be
 * ordered the same as the IDs
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
  
  // TODO: the property shorthand `find(allData, { id })` is preferable and should work-- I'm
  //  confused why it doesn't
  return omitFalsey(ids.map((id) => find(allData, ['id', id])));
}
