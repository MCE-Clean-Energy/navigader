import * as React from 'react';

import { RowsPerPageOption } from '@nav/shared/api/util';
import { isProduction } from '@nav/shared/util';


/** ============================ Types ===================================== */
export type PaginationState = {
  currentPage: number;
  rowsPerPage: RowsPerPageOption;
};

export type SortState = {
  dir: 'asc' | 'desc';
  key: string;
};

type TableContext<T> = {
  allSelected: boolean;
  data: T[],
  disableSelect: (datum: T) => boolean;
  selectable: boolean,
  selections: Set<number>;
  setSortState: (state: SortState) => void;
  sortState?: SortState;
  toggleAllSelections: (allSelected: boolean) => void;
  toggleRowSelection: (rowIndex: number, checked: boolean) => void;
};

/** ============================ Context =================================== */
export const TableContext = React.createContext<TableContext<any>>({
  allSelected: false,
  data: [],
  disableSelect: () => false,
  selectable: false,
  selections: new Set(),
  setSortState: () => {},
  toggleAllSelections: () => {},
  toggleRowSelection: () => {}
});

if (!isProduction()) {
  TableContext.displayName = 'TableContext';
}
