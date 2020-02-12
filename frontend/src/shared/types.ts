
export type PaginationSet<T> = {
  count: number;
  next: null;
  previous: null;
  results: T[]
};
