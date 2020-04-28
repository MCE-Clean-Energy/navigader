/** ============================ Miscellaneous ============================= */
export type MonthIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type Nullable<T> = T | null;

// Used in places where a generic `id` field is expected
export type IdType = string | number;
export interface ObjectWithId { id: IdType }
