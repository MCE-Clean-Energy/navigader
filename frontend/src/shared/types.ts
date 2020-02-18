
export type PaginationSet<T> = {
  count: number;
  next: null;
  previous: null;
  results: T[]
};

export type MonthIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
