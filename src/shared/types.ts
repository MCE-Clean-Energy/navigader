
/** ============================ Querying ================================== */
export type RowsPerPageOption = 10 | 20 | 50 | 100;
export type RawPaginationSet<ResponseSchema> = {
  count: number;
  results: ResponseSchema;
};

export type PaginationSet<Datum> = {
  count: number;
  data: Datum[]
};

export type PaginationQueryParams = {
  page: number;
  pageSize: RowsPerPageOption;
};

export type DynamicRestParams = {
  exclude: string | string[];
  include: string | string[];
}

/** ============================ Common Schema ============================= */
export type NavigaderObject<Type extends string> = {
  created_at: string;
  id: string;
  name: string;
  object_type: Type;
};

export type PandasFrame<RowType extends Record<string, any>> = {
  [Column in keyof RowType]: RowType[Column][];
};

export type RawPandasFrame<RowType extends Record<string, any>> = {
  [Column in keyof RowType]: {
    [index: number]: RowType[Column];
  };
};

export type DeferrableFields<Object, Deferrable extends string, Included extends Deferrable> =
  // Include all keys in `Object` that aren't deferrable
  Omit<Object, KeyIntersection<Object, Deferrable>> &
  // Make the deferrable keys optional
  Partial<Pick<Object, KeyIntersection<Object, Deferrable>>> &
  // Include the deferrable keys that are specifically included
  Pick<Object, KeyIntersection<Object, Included>>;

export type DeferrableFields2<
  CommonFields,
  DeferredFields,
  IncludedFields extends keyof DeferredFields
> =
  CommonFields &
  Partial<DeferredFields> &
  Required<Pick<DeferredFields, IncludedFields>>;

/** ============================ Miscellaneous ============================= */
export type MaybeNull<MaybeType> = MaybeType | null;
export type MonthIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

type KeyIntersection<TypeA, TypeB extends string> = Exclude<
  // Start with all keys
  keyof TypeA & TypeB,
  // Exclude those in TypeA that don't appear in TypeB
  Exclude<keyof TypeA, TypeB> &
  // As well as those that appear in TypeB but not TypeA
  Exclude<TypeB, keyof TypeA>
>;

// Used in places where a generic `id` field is expected
export type IdType = string | number;
export type ObjectWithId = { id: IdType };
