import _ from 'lodash';


/** ============================ Miscellaneous helpers ===================== */
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
 * jsdom strangely does not allow instantiating a `FileList` object. This method creates and returns
 * an object that mocks the FileList API sufficiently for our needs
 *
 * @param {File[]} files: array of files to include in the FileList
 */
export const makeFileList = (files: File[]): FileList => {
  return Object.assign(
    [...files], {
      item: (n: number) => files[n]
    });
};

/**
 * Basic polyfill for `Array.prototype.forEach` which awaits the completion of the callback before
 * moving on to the next array entry. This is useful when rendering components in a loop, such as
 * when testing how a component handles multiple test cases. Typical usage:
 *
 *   await asyncForEach([1, 2, 3], async (num) => {
 *     const { getByRole } = render(<MyComponent num={num} />);
 *     // ... test assertions here ... //
 *     await cleanup();
 *   });
 *
 *   // ... post loop actions here ... //
 *
 * @param {Array<T>>} array: the array to iterate over
 * @param {function} callback: the async callback to call for each array entry
 */
export async function asyncForEach <T>(
  array: T[],
  callback: (entry: T, index: number, arr: any[]) => Promise<void>
) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

/**
 * Creates all combinations of a given array. For example:
 *
 *   ```
 *   > getCombinations([0, 1, 2])
 *   [
 *     [],       [ 0 ],
 *     [ 1 ],    [ 0, 1 ],
 *     [ 2 ],    [ 0, 2 ],
 *     [ 1, 2 ], [ 0, 1, 2 ]
 *   ]
 *   ```
 *
 * @param {T[]} array: an array of any type
 */
export function getCombinations <T = any>(array: T[]) {
  // Start with the empty set
  const combinations: Array<T[]> = [[]];

  for (let value of array) {
    // Can't use combinations.length in loop since results length is increased in loop
    const length = combinations.length;

    for (let i = 0; i < length; i++) {
      // Make a clone of the value at index i and add current value
      const temp = [...combinations[i], value];

      // Add clone back to results array
      combinations.push(temp);
    }
  }

  return combinations;
}


/** ============================ API Helpers =============================== */
/**
 * Returns a string representing a pagination result. The return value is a string intended to mimic
 * the nature of the server response.
 *
 * @param {object} results: the object to return under the `results` key of the response
 * @param {number} [count]: the number of results
 */
export function makePaginationResponse (results: object, count: number = 1) {
  return {
    count,
    next: null,
    previous: null,
    results
  };
}

export function mockFetch (endpoints: Array<[string | RegExp, any]>) {
  fetchMock.resetMocks();

  // Set up URLs to mock
  fetchMock.mockResponse(async (req) => {
    const match = _.find(endpoints, ([uri]) =>
      typeof uri === 'string' ? req.url.includes(uri) : uri.test(req.url)
    );

    return match ? JSON.stringify(match[1]) : 'default mock response';
  });
}
