/**
 * Contains methods that can be re-used in tests
 */

/**
 * Given a URL with a querystring and an array of pairs of strings, asserts that the first string
 * of each pair is a query parameter in the querystring and the second string of each pair is its
 * associated value
 *
 * @param {string} url: the URL with the querystring
 * @param {[string, string][]} queryParams: the array of query parameter keys and values
 */
export function assertHasQueryParams <T extends string>(
  url: string,
  queryParams: Array<[T, string | string[]]>
) {
  const urlQueryString = url.split('?')[1];

  // Parse the query string into an object mapping keys to values. If there's an array key (e.g.
  // `include[]`) then the value is wrapped in a set with other values under the same array key
  const urlQueryParams = urlQueryString.split('&').reduce((obj, str) => {
    const [key, val] = str.split('=') as [T, string];

    // Array query parameters get an array
    if (key.endsWith('[]')) {
      const existingValue = obj[key];
      if (existingValue instanceof Set) {
        existingValue.add(val);
      } else {
        obj[key] = new Set([val]);
      }
    } else {
      obj[key] = val;
    }

    return obj;
  }, {} as Record<T, string | Set<string>>);

  // Make the actual assertions
  queryParams.forEach(([key, val]) => {
    if (Array.isArray(val)) {
      val.forEach((arrVal) => {
        expect(urlQueryParams[key]).toContain(arrVal);
      });
    } else {
      expect(urlQueryParams[key]).toEqual(val);
    }
  });
}

/**
 * Returns a string representing a pagination result. The return value is a string intended to mimic
 * the nature of the server response.
 *
 * @param {object} results: the object to return under the `results` key of the response
 */
export function makePaginationResponse (results: object) {
  return JSON.stringify({
    count: 1,
    next: null,
    previous: null,
    results
  });
}
