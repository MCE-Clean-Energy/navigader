/** ============================ Types ===================================== */
export type PaginationSet<Datum> = {
  count: number;
  data: Datum[]
};

export type RawPaginationSet<ResponseSchema> = {
  count: number;
  results: ResponseSchema;
};

// The option `1` is not an option presented to the user in the table pagination. It's a hackish
// way of querying the server for the number of records (the `count`) without loading many
export type RowsPerPageOption = 1 | 10 | 20 | 50 | 100;
export type PaginationQueryParams = {
  page: number;
  page_size: RowsPerPageOption;
};

/** ============================ Helpers =================================== */
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
