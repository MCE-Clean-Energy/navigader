import { PaginationQueryParams, PaginationSet, RawPaginationSet } from '@nav/shared/types';
import { getCookie, omitFalsey } from '@nav/shared/util';


/** ============================ Types ===================================== */
/**
 * Needless to say, this is not a complete set of HTTP method types. It is the set of the ones used
 * in the NavigaDER application.
 */
type HttpMethodType = 'GET' | 'PATCH' | 'POST';
type Stringable = {
  toString(): string;
}

// Note that this should really just be `Stringable`. However, there will be many times when
// some query parameters are optional. With `--strictNullChecks` turned on, Typescript
// automatically converts optional properties to `type | undefined`, and so when such query
// parameter objects are passed along to the utility method the typechecker throws an error if
// we omit the `| undefined` here.
type QueryObject = Record<string, Stringable | undefined>;
type QueryParams = QueryObject & {
  filter?: QueryObject;
};

type ContentType = 'application/json' | 'multipart/form-data';

/** ============================ API Methods =============================== */
/**
 * Makes a request using the fetch API
 *
 * @param {HttpMethodType} method: the HTTP method to use for the request (e.g. GET, POST, etc)
 * @param {string} route: the LOCAL route to send the request to. I.e. this should begin with a "/"
 * @param {object} body: the body of the request. Typically this will be JSON.
 */
function makeJsonRequest (method: HttpMethodType, route: string, body?: string | FormData) {
  return fetch(route, {
    body,
    headers: getRequestHeaders('application/json'),
    method
  });
}

/**
 * Emulates a form submission using the fetch API
 *
 * @param {string} route: the route to send the request to
 * @param {object} formFields: an object mapping form data fields to their values
 */
export function makeFormPost (route: string, formFields: object) {
  const formData = new FormData();
  Object.entries(formFields).forEach(([fieldName, value]) => {
    formData.append(fieldName, value);
  });
  
  return fetch(route, {
    body: formData,
    headers: getRequestHeaders(),
    method: 'POST'
  });
}

export function getRequest (route: string, queryParams?: QueryParams) {
  return makeJsonRequest('GET', route.concat(makeQueryString(queryParams)));
}

export function postRequest (route: string, body: object) {
  return makeJsonRequest('POST', route, JSON.stringify(body));
}

export function patchRequest (route: string, body: object) {
  return makeJsonRequest('PATCH', route, JSON.stringify(body));
}

/** ============================ Helpers =============================== */
/**
 * Takes a route and returns a function that will return the route as given if the function is
 * called without an argument, or the route with an ID appended if an argument is provided.
 *
 * @param {string} route - The base route
 */
export function appendId (route: string) {
  return (id?: number | string) => {
    return (id ? [route, id].join('/') : route).concat('/');
  };
}

/**
 * Parses a raw pagination set (the raw response from the back end for a paginated endpoint) into a
 * parsed pagination set. If there's no need to parse the data (e.g. if there are no sideload data)
 * then passing a string under which the results are nested is sufficient
 *
 * @param {RawPaginationSet} paginationSet: the raw server response to parse
 * @param {string} resultsKey: they key under which the data array lies
 */
export function parsePaginationSet <ResultsKey extends string, Datum>(
  paginationSet: RawPaginationSet<Record<ResultsKey, Datum[]>>,
  resultsKey: ResultsKey
): PaginationSet<Datum>;

/**
 * Parses a raw pagination set (the raw response from the back end for a paginated endpoint) into a
 * parsed pagination set.
 *
 * @param {RawPaginationSet} paginationSet: the raw server response to parse
 * @param {Function} [parseFn]: a function that parses an individual result from its raw version
 *   to its parsed version. Defaults to the identity function
 */
export function parsePaginationSet <RawSchema, Datum>(
  paginationSet: RawPaginationSet<RawSchema>,
  parseFn: (schema: RawSchema) => Datum[]
): PaginationSet<Datum>;

export function parsePaginationSet <RawSchema, ResultsKey extends string, Datum>(
  paginationSet: any,
  parseFnOrResultsKey?: any
): any {
  const isArray = Array.isArray(paginationSet.results);
  
  // If the results are not array-like, a parse function or results key must be provided
  if (!(isArray || parseFnOrResultsKey)) {
    throw Error('`parsePaginationSet` called incorrectly');
  }
  
  let data;
  if (isArray) {
    data = typeof parseFnOrResultsKey === 'function'
      ? paginationSet.results.map(parseFnOrResultsKey)
      : paginationSet.results;
  } else if (typeof parseFnOrResultsKey === 'function') {
    data = parseFnOrResultsKey(paginationSet.results);
  } else {
    data = paginationSet.results[parseFnOrResultsKey];
  }
  
  return {
    count: paginationSet.count,
    data
  };
}

/**
 * Produces the headers to send with a request
 *
 * @param {ContentType} contentType: the value for the 'Content-Type` header
 */
function getRequestHeaders (contentType?: ContentType) {
  const authToken = getCookie('authToken');
  return new Headers(
    omitFalsey({
      'Authorization': authToken && `Token ${authToken}`,
      'Content-Type': contentType,
      'X-CSRFToken': getCookie('csrftoken')
    })
  );
}

const beoUri = process.env.REACT_APP_BEO_URI;
export const beoRoute = {
  restAuth: (rest: string) => `${beoUri}/rest-auth/${rest}`,
  v1: (rest: string) => `${beoUri}/v1/${rest}`
};

/**
 * Produces the querystring for a request, given an object representing the key-value pairs to
 * include in the querystring.
 *
 * @param {QueryParams} qs: the object of key-value pairs that should be converted into a
 *   querystring
 */
function makeQueryString (qs?: QueryParams): string {
  if (!qs) return '';
  
  const queryString = Object.entries(omitFalsey(qs))
    .map(([key, value]) => {
      let paramKey = key;
      let paramValue = value.toString();
      
      // Special cases for dynamic-rest
      if (['include', 'exclude'].includes(key)) {
        paramKey = `${key}[]`;
        
        if (Array.isArray(value)) {
          return value
            .map(v => [paramKey, encodeURIComponent(v)].join('='))
            .join('&');
        }
      } else if (key === 'filter') {
        // Each of the filters gets its own `filter` query parameter
        return Object.entries(omitFalsey(value))
          .map(([key, value]) =>
            [
              `filter{${key}}`,
              encodeURIComponent(value.toString())
            ].join('=')
          ).join('&');
      }
      
      return [paramKey, encodeURIComponent(paramValue)].join('=');
    })
    .join('&');
  
  return queryString.length === 0
    ? ''
    : `?${queryString}`;
}

/**
 * Produces query parameters for pagination queries
 *
 * @param {PaginationQueryParams} queryParams: object with `page` and `pageSize`
 */
export function makePaginationQueryParams (queryParams?: Partial<PaginationQueryParams>) {
  if (!queryParams) return {};
  return {
    page: queryParams.page,
    page_size: queryParams.pageSize
  };
}
