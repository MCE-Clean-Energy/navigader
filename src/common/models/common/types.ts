/** ============================ Miscellaneous ============================= */
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
