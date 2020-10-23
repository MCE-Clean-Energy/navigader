import * as React from 'react';

import { RowsPerPageOption, SortDir } from 'navigader/types';
import { isProduction } from 'navigader/util';


/** ============================ Types ===================================== */
export type PaginationCallbackArgs = PaginationState & Partial<SortState>;
export type PaginationState = {
  currentPage: number;
  rowsPerPage: RowsPerPageOption;
};

export type SortState = {
  dir: SortDir;
  key: string;
};

export type DisabledSelectComponent<T> = React.FC<{ datum: T }>;

type TableContextType<T> = {
  allSelected: boolean;
  data: T[],
  disableSelect: (datum: T) => boolean;
  DisabledSelectComponent?: DisabledSelectComponent<T>;
  hover: boolean;
  selectable: boolean,
  selections: Set<number>;
  setSortState: (state: SortState) => void;
  sortState?: SortState;
  toggleAllSelections: (allSelected: boolean) => void;
  toggleRowSelection: (rowIndex: number, checked: boolean) => void;
};

/** ============================ Context =================================== */
export const TableContext = React.createContext<TableContextType<any>>({
  allSelected: false,
  data: [],
  disableSelect: () => false,
  DisabledSelectComponent: undefined,
  hover: true,
  selectable: false,
  selections: new Set(),
  setSortState: () => {},
  toggleAllSelections: () => {},
  toggleRowSelection: () => {}
});

if (!isProduction()) {
  TableContext.displayName = 'TableContext';
}
