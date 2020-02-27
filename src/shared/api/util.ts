import { PaginationSet, PaginationSetRaw } from '@nav/shared/types';
import { getCookie, omitFalsey } from '@nav/shared/util';


/** ============================ Types ===================================== */
/**
 * Needless to say, this is not a complete set of HTTP method types. It is the set of the ones used
 * in the NavigaDER application.
 */
type HttpMethodType = 'GET' | 'POST';
type Stringable = {
  toString(): string;
}

type QueryParams = {
  // Note that this should really just be `Stringable`. However, there will be many times when
  // some query parameters are optional. With `--strictNullChecks` turned on, Typescript
  // automatically converts optional properties to `type | undefined`, and so when such query
  // parameter objects are passed along to the utility method the typechecker throws an error if
  // we omit the `| undefined` here.
  [x: string]: Stringable | undefined;
}

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
    headers: getRequestHeaders(null),
    method: 'POST'
  });
}

export function getRequest (route: string, queryParams?: QueryParams | null) {
  let completeRoute = route;
  if (queryParams) {
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => {
        // Again, this filtering step should not be necessary. This is only here to provide a
        // typeguard so that `value.toString` is allowed. See note above.
        if (typeof value === 'undefined') return null;
        return [
          encodeURIComponent(key),
          encodeURIComponent(value.toString())
        ].join('=');
      })
      // Remove the `null` values produced above
      .filter(value => !!value)
      .join('&');

    completeRoute = completeRoute.concat(`?${queryString}`);
  }
  
  return makeJsonRequest('GET', completeRoute);
}

export function postRequest (route: string, body: object) {
  return makeJsonRequest('POST', route, JSON.stringify(body));
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
 * parsed pagination set.
 *
 * @param {PaginationSetRaw} paginationSet - The raw server response to parse
 * @param {Function} [parseFn] - A function that parses an individual result from its raw version
 *   to its parsed version.
 */
export function parsePaginationSet <T, K>(
  paginationSet: PaginationSetRaw<T>,
  parseFn: (result: T) => K
): PaginationSet<K> {
  return {
    count: paginationSet.count,
    hasNext: typeof paginationSet.next === 'string',
    hasPrevious: typeof paginationSet.previous === 'string',
    data: paginationSet.results.map(parseFn)
  };
}

function getRequestHeaders (contentType: ContentType | null) {
  const authToken = getCookie('authToken');
  return new Headers(
    omitFalsey({
      'Authorization': authToken && `Token ${authToken}`,
      'Content-Type': contentType,
      'X-CSRFToken': getCookie('csrftoken')
    })
  );
}
