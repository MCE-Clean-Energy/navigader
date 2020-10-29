import * as React from 'react';

import { SortFields } from 'navigader/types';
import { isProduction } from 'navigader/util';

/** ============================ Types ===================================== */
export type DisabledSelectComponent<T> = React.FC<{ datum: T }>;
type TableContextType<T> = {
  allSelected: boolean;
  data: T[];
  disableSelect: (datum: T) => boolean;
  DisabledSelectComponent?: DisabledSelectComponent<T>;
  hover: boolean;
  selectable: boolean;
  selections: Set<number>;
  setSortState: (state: SortFields) => void;
  sortState: SortFields;
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
  sortState: {},
  toggleAllSelections: () => {},
  toggleRowSelection: () => {},
});

if (!isProduction()) {
  TableContext.displayName = 'TableContext';
}
