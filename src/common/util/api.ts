import {
  DynamicRestParams, FilterEqualClause, FilterInClause, IncludeExcludeFields, QueryParams,
  QueryStringPrimitive
} from 'navigader/types';
import _ from './lodash';
import { omitFalsey } from './omitFalsey';
import { printWarning } from './printWarning';


/** ============================ Types ===================================== */
type QueryParamPair = [string, QueryStringPrimitive | QueryStringPrimitive[]];

/** ============================ Query compilation ========================= */
function makeFilterQueryParams (filterClauses: DynamicRestParams['filter']): QueryParamPair[] {
  if (!filterClauses) return [];
  
  // Each of the filters gets its own `filter` query parameter
  const queryParamPairs: QueryParamPair[] = [];
  Object.entries(filterClauses)
    .forEach(([field, filterClause]) => {
      if (filterClause.operation === 'in') {
        // Every value in the `IN` clause gets its own query parameter
        const paramKey = `filter{${field}.in}`;
        queryParamPairs.push(...filterClause.value.map(v => [paramKey, v] as QueryParamPair));
      } else {
        queryParamPairs.push([`filter{${field}}`, filterClause.value]);
      }
    });
  
  return queryParamPairs;
}

function makeIncludeExcludeQueryParam (
  key: string,
  fields?: IncludeExcludeFields
): QueryParamPair[] {
  if (!fields) return [];
  
  // If the value is an array, repeat the parameter key once per element
  const paramKey = `${key}[]`;
  return Array.isArray(fields)
    ? fields.map(v => [paramKey, v])
    : [[paramKey, fields]];
}


/**
 * Produces the querystring for a request, given an object representing the key-value pairs to
 * include in the querystring.
 *
 * @param {QueryParams} params: the object of key-value pairs that should be converted into a
 *   querystring
 */
export function makeQueryString (params?: QueryParams): string {
  if (!params) return '';
  
  // Handle any dynamic rest params
  const drQueryParamPairs = [
    ...makeIncludeExcludeQueryParam('include', params.include),
    ...makeIncludeExcludeQueryParam('exclude', params.exclude),
    ...makeFilterQueryParams(params.filter)
  ];
  
  // Handle all other params
  const nonDynamicRestParams = _.omit(params, ['exclude', 'include', 'filter']);
  const nonDRQueryParamPairs: QueryParamPair[] = omitFalsey(Object.entries(nonDynamicRestParams)
    .map(([key, value]) => {
      // Apply some basic validation on the `unknown` type
      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        Array.isArray(value)
      ) {
        return [key, value];
      }
      
      // Print a warning and return `null`. The `null` value will be removed by `omitFalsey`
      printWarning(`Query parameter "${key}" received invalid value: ${value}`);
      return null;
    }));
    
  // Reduce the array of pairs
  const queryString = [...drQueryParamPairs, ...nonDRQueryParamPairs]
    .map(([param, value]) => [param, encodeURIComponent(value.toString())].join('='))
    .join('&');
  
  return queryString.length === 0
    ? ''
    : `?${queryString}`;
}

/** ============================ Clause builders =========================== */
const in_ = (values?: Array<QueryStringPrimitive>) => ({
  operation: 'in',
  value: values
}) as FilterInClause;

const equals_ = (value: QueryStringPrimitive) => ({
  operation: 'equals',
  value
}) as FilterEqualClause;

export const filterClause = {
  in: in_,
  equals: equals_
};
