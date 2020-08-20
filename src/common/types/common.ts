/** ============================ Common model fields ======================= */
export interface NavigaderObject<Type extends string> {
  created_at: string;
  id: string;
  object_type: Type;
}

export interface ProgressFields {
  progress: {
    is_complete: boolean;
    percent_complete: number;
  };
}

/** ============================ Pandas Frames ============================= */
export type PandasFrame<RowType extends Record<string, any>> = {
  [Column in keyof RowType]: RowType[Column][];
};

export type RawPandasFrame<RowType extends Record<string, any>> = {
  [Column in keyof RowType]: {
    [index: number]: RowType[Column];
  };
};

/** ============================ Utility types ============================= */
// This is meant to capture all values in JS that evaluate to `false` when passed through the
// Boolean constructor. This is incomplete, and perhaps impossible to do with TypeScript because
// there are some language values which types can't capture. For example, the type of `NaN` is
// `number`, yet `Boolean(NaN) === false`.
export type Falsey = false | 0 | '' | null | undefined;
export type Nullable<T> = T | null;
export type Maybe<T> = T | undefined;

// Used in places where a generic `id` field is expected
export type IdType = string | number;
export interface ObjectWithId { id: IdType }

// Tuples
export type Tuple<T> = [T, T];
export type NumberTuple = Tuple<number>;
export type DateTuple = Tuple<Date>;

// Months
export type MonthIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type MonthsOption = MonthIndex[] | 'all';
