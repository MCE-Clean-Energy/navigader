import * as React from 'react';

import { RowsPerPageOption } from '@nav/shared/api/util';
import { isProduction } from '@nav/shared/util';


/** ============================ Types ===================================== */
export type PaginationState = {
  currentPage: number;
  rowsPerPage: RowsPerPageOption;
};

type TableContext<T> = {
  allSelected: boolean;
  data: T[],
  disableSelect: (datum: T) => boolean;
  selectable: boolean,
  selections: Set<number>;
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
  toggleAllSelections: (allSelected: boolean) => {},
  toggleRowSelection: (rowIndex: number) => {}
});

if (!isProduction()) {
  TableContext.displayName = 'TableContext';
}
