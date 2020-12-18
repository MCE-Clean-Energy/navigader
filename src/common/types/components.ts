import * as React from 'react';

import { PaginationFields, PaginationQueryParams, PaginationSet, SortDir, SortFields } from './api';
import { IdType, ObjectWithId } from './common';

/** ============================ Alert ===================================== */
export type AlertType = 'error' | 'warning' | 'info' | 'success';

/** ============================ Flex ====================================== */
export type AlignItemsValue = 'center' | 'flex-start' | 'stretch';
export type FlexDirection = 'row' | 'column';
export type WrapValue = 'wrap' | 'nowrap';
export type JustifyContentValue =
  | 'center'
  | 'flex-start'
  | 'flex-end'
  | 'space-between'
  | 'space-around';

/** ============================ Table ===================================== */
// Props
export type TableProps<T extends ObjectWithId> = {
  children: (data: T[], emptyRow: React.FC) => React.ReactElement;
  containerClassName?: string;
  dataFn: (params: PaginationQueryParams) => Promise<PaginationSet<T>>;
  disableSelect?: (datum: T) => boolean;
  DisabledSelectComponent?: DisabledSelectComponent<T>;
  headerActions?: React.ReactNode;
  hover?: boolean;
  initialSorting?: { dir: SortDir; key: string };
  onFabClick?: () => void;
  onSelect?: (selections: T[]) => void;
  raised?: boolean;
  size?: 'small' | 'medium';
  title?: string;
};

// State
export type TableState = PaginationFields & {
  count?: number;
  dataIds?: IdType[];
  loading: boolean;
  selections: Set<number>;
  sorting: SortFields;
};

// Context
export type TableContextType<T> = {
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

// Ref
export type TableRef<T extends ObjectWithId> = React.RefObject<TableInterface<T>>;

// Components
export type DisabledSelectComponent<T> = React.FC<{ datum: T }>;
export interface TableInterface<T extends ObjectWithId>
  extends React.Component<TableProps<T>, TableState> {
  componentDidMount(): void;
  componentDidUpdate(prevProps: Readonly<TableProps<T>>, prevState: Readonly<TableState>): void;
  fetch(): void;
  getData(): T[];
  render(): React.ReactElement;
}
