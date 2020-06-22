export type Nullable<T> = T | null;

export type MonthIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type MonthsOption = MonthIndex[] | 'all';

// Used in places where a generic `id` field is expected
export type IdType = string | number;
export interface ObjectWithId { id: IdType }

export type Tuple<T> = [T, T];

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
