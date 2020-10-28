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
export interface ObjectWithId {
  id: IdType;
}

// Tuples
export type Tuple<T> = [T, T];
export type NumberTuple = Tuple<number>;
export type DateTuple = Tuple<Date>;

// Months
export type MonthIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type MonthsOption = MonthIndex[] | 'all';

// Creates a type that excludes the keys of `T2` from those of `T1`
export type Without<T1, T2> = Omit<T1, keyof T2>;

// This helps to filter types down to their keys whose types match a given type. For example:
//
//   type User = { id: number; name: string; joined: Date }
//   type UserStringFields = KeysMatching<User, string> --> 'name'
//   type UserOtherFields = KeysMatching<User, number | Date> --> 'id' | 'joined'
export type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

// All US states and territories plus DC and military mail. Taken from the `localflavor` Python
// package.
export type StateChoice =
  | 'AL'
  | 'AK'
  | 'AS'
  | 'AZ'
  | 'AR'
  | 'AA'
  | 'AE'
  | 'AP'
  | 'CA'
  | 'CO'
  | 'CT'
  | 'DE'
  | 'DC'
  | 'FL'
  | 'GA'
  | 'GU'
  | 'HI'
  | 'ID'
  | 'IL'
  | 'IN'
  | 'IA'
  | 'KS'
  | 'KY'
  | 'LA'
  | 'ME'
  | 'MD'
  | 'MA'
  | 'MI'
  | 'MN'
  | 'MS'
  | 'MO'
  | 'MT'
  | 'NE'
  | 'NV'
  | 'NH'
  | 'NJ'
  | 'NM'
  | 'NY'
  | 'NC'
  | 'ND'
  | 'MP'
  | 'OH'
  | 'OK'
  | 'OR'
  | 'PA'
  | 'PR'
  | 'RI'
  | 'SC'
  | 'SD'
  | 'TN'
  | 'TX'
  | 'UT'
  | 'VT'
  | 'VI'
  | 'VA'
  | 'WA'
  | 'WV'
  | 'WI'
  | 'WY';
