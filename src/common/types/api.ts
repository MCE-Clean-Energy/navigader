import { Frame288DataType } from './data';


/** ============================ Pagination  =============================== */
export type PaginationSet<Datum> = {
  count: number;
  data: Datum[]
};

export type RawPaginationSet<ResponseSchema> = {
  count: number;
  results: ResponseSchema;
};

export type PaginationQueryParams = {
  page: number;
  page_size: RowsPerPageOption;
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

export type FilterInClause = {
  operation: 'in';
  value: Array<QueryStringPrimitive>;
}

export type FilterEqualClause = {
  operation: 'equals';
  value: QueryStringPrimitive;
}

export type IncludeExcludeFields = string | string[];
export type DynamicRestParams = Partial<{
  exclude: IncludeExcludeFields;
  include: IncludeExcludeFields;
  filter: {
    [key: string]: FilterEqualClause | FilterInClause;
  };
}>;

export type DataType = 'default' | Frame288DataType;
export type DataTypeParams = Partial<{
  data_types: DataType | DataType[];
  end_limit: string;
  period: number;
  start: string;
}>
