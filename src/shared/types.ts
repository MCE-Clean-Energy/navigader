
export type RowsPerPageOption = 10 | 20 | 50 | 100;
export type PaginationSetRaw<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[]
};

export type PaginationQueryParams = {
  page: number;
  pageSize: RowsPerPageOption;
};

export type PaginationSet<T> = {
  count: number;
  hasNext: boolean;
  hasPrevious: boolean;
  data: T[]
};

export type MonthIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// Schema that is common to many objects
export type NavigaderObject<Type extends string, Data = {}> = {
  created_at: string;
  data: Data;
  id: string;
  name?: string;
  object_type: Type;
};
