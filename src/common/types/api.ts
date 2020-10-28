import { KeysMatching } from './common';
import { Frame288DataType } from './data';

/** ============================ Pagination  =============================== */
export type PaginationSet<Datum> = {
  count: number;
  data: Datum[];
};

export type RawPaginationSet<ResponseSchema> = {
  count: number;
  results: ResponseSchema;
};

export type SortDir = 'asc' | 'desc';
export type PaginationQueryParams = {
  page: number;
  page_size: RowsPerPageOption;
  sortKey?: string;
  sortDir?: SortDir;
};

export type QueryParams = Partial<PaginationQueryParams & DynamicRestParams> & {
  [key: string]: unknown;
};

// The option `1` is not an option presented to the user in the table pagination. It's a hackish
// way of querying the server for the number of records (the `count`) without loading many
export type RowsPerPageOption = 1 | 10 | 20 | 50 | 100;

/** ============================ Querying ================================== */
export type DeferrableFields<CommonFields, DeferredFields> = CommonFields & Partial<DeferredFields>;
export type QueryStringPrimitive = string | number;

export type FilterableFields<T> = KeysMatching<T, QueryStringPrimitive>;
export type FilterClause = FilterInClause | FilterEqualClause;
export type FilterInClause = {
  operation: 'in';
  value: Array<QueryStringPrimitive>;
};

export type FilterEqualClause = {
  operation: 'equals';
  value: QueryStringPrimitive;
};

export type IncludeExcludeFields<Field extends string = string> = Field | Field[];
export type DynamicRestFilters = { [key: string]: FilterClause };
export type DynamicRestParams<Field extends string = string> = Partial<{
  exclude: IncludeExcludeFields<Field>;
  include: IncludeExcludeFields<Field>;
  filter: DynamicRestFilters;
}>;

export type DataType = 'default' | Frame288DataType;
export type DataTypeParams = Partial<{
  data_types: DataType | DataType[];
  end_limit: string;
  period: number;
  start: string;
}>;

/** ============================ Request management ======================== */
// This is an experimental type. It represents a resource that is in the process of being loaded.
export type Loader<T> = T & { loading: boolean };
