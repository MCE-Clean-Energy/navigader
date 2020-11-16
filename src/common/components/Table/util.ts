import * as React from 'react';

import { TableContextType } from 'navigader/types';
import { isProduction } from 'navigader/util';

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
