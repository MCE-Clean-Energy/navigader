
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

/** ============================ API Methods =============================== */
function makeRequest (method: HttpMethodType, route: string, body?: object) {
  const headers = new Headers({
    'Content-Type': 'application/json'
  });
  
  return fetch(route, {
    body: JSON.stringify(body),
    headers,
    method
  });
}

function getRequest (route: string, queryParams?: QueryParams | null) {
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
  
  return makeRequest('GET', completeRoute);
}

function postRequest (route: string, body: object) {
  return makeRequest('POST', route, body);
}

/** ============================ Helpers =============================== */
/**
 * Takes a route and returns a function that will return the route as given if the function is
 * called without an argument, or the route with an ID appended if an argument is provided.
 *
 * @param {string} route - The base route
 */
function appendId (route: string) {
  return (id?: number | string) => {
    return (id ? [route, id].join('/') : route).concat('/');
  };
}

/** ============================ Exports =================================== */
export {
  appendId,
  getRequest,
  makeRequest,
  postRequest
};
