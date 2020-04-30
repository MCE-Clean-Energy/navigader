import * as React from 'react';
import isEmpty from 'lodash/isEmpty';
import MuiPaper from '@material-ui/core/Paper';
import MuiTable from '@material-ui/core/Table';
import MuiTableBody from '@material-ui/core/TableBody';
import MuiTableCell from '@material-ui/core/TableCell';
import MuiTableContainer from '@material-ui/core/TableContainer';
import MuiTableHead from '@material-ui/core/TableHead';
import MuiTableRow from '@material-ui/core/TableRow';
import MuiTableSortLabel from '@material-ui/core/TableSortLabel';
import omit from 'lodash/omit';

import { PaginationSet } from '@nav/common/api/util';
import { Checkbox, Flex, Progress, SortState, Typography } from '@nav/common/components';
import { RootState } from '@nav/common/store';
import { makeStylesHook } from '@nav/common/styles';
import { IdType, ObjectWithId} from '@nav/common/types';
import { hooks, makeCancelableAsync } from '@nav/common/util';
import { TablePagination } from './Pagination';
import { PaginationState, TableContext } from './util';


/** ============================ Types ===================================== */
type EmptyRowProps = React.PropsWithChildren<{
  colSpan: number;
}>;

export type TableProps<T extends ObjectWithId> = {
  children: (data: T[], emptyRow: React.FC<EmptyRowProps>) => React.ReactElement;
  containerClassName?: string;
  dataFn: (state: PaginationState & Partial<SortState>) => Promise<PaginationSet<T>>;
  dataSelector: (state: RootState) => T[];
  disableSelect?: (datum: T) => boolean;
  initialSorting?: SortState;
  onSelect?: (selections: T[]) => void;
  raised?: boolean;
  stickyHeader?: boolean;
  title?: string;
};

type TableCellProps = {
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  className?: string;
  colSpan?: number;
  rowSpan?: number;
  sortBy?: string;
  sortDir?: SortState['dir'];
  // These props should not be provided by consuming components-- they are provided by the
  // `TableHead` and `TableBody` components
  _columnIndex?: number;
  _isHeaderRow?: boolean;
};

type TableHeadProps = {};
type TableBodyProps = {};

type TableRowProps = {
  className?: string;
  // These props should not be provided by consuming components-- they are provided by the
  // `TableHead` and `TableBody` components
  _disableSelect?: boolean;
  _isHeaderRow?: boolean;
  _onChange?: (checked: boolean) => void;
  _selected?: boolean;
};

type TableBody = React.FC<TableBodyProps>;
type TableCell = React.FC<TableCellProps>;
type TableHead = React.FC<TableHeadProps>;
type TableRow = React.FC<TableRowProps>;

type DataState = {
  dataIds: IdType[] | null;
  count: number | null;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  header: {
    // Provides the proper height for the toolbar
    ...theme.mixins.toolbar
  },
  progressBarSpacer: {
    height: 4
  }
}), 'NavigaderTable');

/** ============================ Components ================================ */
const TableRaiser: React.FC = (props) => <MuiPaper elevation={8} {...props} />;
export function Table <T extends ObjectWithId>(props: TableProps<T>) {
  const {
    children,
    dataFn,
    dataSelector,
    disableSelect = () => false,
    containerClassName,
    initialSorting,
    onSelect,
    raised = false,
    title,
    ...rest
  } = props;
  
  const classes = useStyles();
  
  // State
  const [loading, setLoading] = React.useState(true);
  const [selections, setSelections] = React.useState<Set<number>>(new Set());
  const [dataState, setDataState] = React.useState<DataState>({
    dataIds: null,
    count: null
  });
  const [paginationState, setPaginationState] = React.useState<PaginationState>({
    currentPage: 0,
    rowsPerPage: 20
  });
  const [sortState, setSortState] = React.useState(initialSorting);
  
  // Load data
  React.useEffect(makeCancelableAsync(() => {
    setLoading(true);
    return dataFn({ ...paginationState, ...sortState })
  }, (paginationSet) => {
    setLoading(false);
    setDataState({
      count: paginationSet.count,
      dataIds: paginationSet.data.map(datum => datum.id)
    });
  }), [dataFn, paginationState, sortState]);
  
  // Get the data from the store using the IDs
  const { dataIds, count } = dataState;
  const data = hooks.useTableSelector(dataSelector, dataIds);
  
  // Build context for child component tree
  const loadedData = !loading && !isEmpty(data);
  const selectables = data.filter(d => !disableSelect(d));
  const tableContext = {
    allSelected: selectables.length > 0 && selectables.length === selections.size,
    data,
    disableSelect,
    selectable: Boolean(onSelect) && loadedData,
    selections,
    setSortState,
    sortState,
    toggleAllSelections,
    toggleRowSelection
  };

  return (
    <div>
      <Flex.Container alignItems="center" className={classes.header} justifyContent="space-between">
        <Typography variant="h6">{title}</Typography>
        {data &&
          <TablePagination
            count={count}
            paginationState={paginationState}
            updatePaginationState={updatePaginationState}
          />
        }
      </Flex.Container>
      <MuiTableContainer className={containerClassName} component={raised ? TableRaiser : MuiPaper}>
        <MuiTable {...rest}>
          <TableContext.Provider value={tableContext}>
            {children(data || [], EmptyRow)}
          </TableContext.Provider>
        </MuiTable>
      </MuiTableContainer>
      {loading ? <Progress /> : <div className={classes.progressBarSpacer} />}
    </div>
  );
  
  /** ============================ Callbacks =============================== */
  function EmptyRow (props: EmptyRowProps) {
    if (count !== 0) return null;
    return (
      <Table.Row>
        <Table.Cell {...props} />
      </Table.Row>
    );
  }
  
  function updatePaginationState (newState: PaginationState) {
    setPaginationState(newState);
    updateSelections(new Set());
  }
  
  /**
   * Called when the header's selection checkbox changes state
   *
   * @param {boolean} selectAll: true if the checkbox is now checked (i.e. if all rows ought to
   *   become selected)
   */
  function toggleAllSelections (selectAll: boolean) {
    // Can't do anything without data
    if (!data) return;
    if (selectAll) {
      const selectables = data.filter(d => !disableSelect(d));
      updateSelections(new Set(selectables.map(d => data.indexOf(d))));
    } else {
      updateSelections(new Set());
    }
  }
  
  /**
   * Called when a row's selection checkbox changes state
   *
   * @param {number} rowIndex: the index of the row whose selection state is toggling
   * @param {boolean} checked: true if the checkbox is now checked (i.e. if the row is now selected)
   */
  function toggleRowSelection (rowIndex: number, checked: boolean) {
    const newSelections = new Set(selections);
    
    if (checked) newSelections.add(rowIndex);
    else newSelections.delete(rowIndex);
    
    updateSelections(newSelections);
  }
  
  /**
   * Updates the selection state and calls the `onSelect` callback if provided
   *
   * @param {Set<number>} indices: the row indices of the now-selected data
   */
  function updateSelections (indices: Set<number>) {
    setSelections(indices);
    
    if (data && onSelect) {
      // Map the indices to the actual data
      onSelect([...indices].map(index => data[index]));
    }
  }
}

const TableBody: TableBody = (props) => {
  const { data, disableSelect, selections, toggleRowSelection } = React.useContext(TableContext);
  
  // Keeps track of the index of each row. This is augmented once per table row in the loop
  let rowIndex = 0;
  
  return (
    <MuiTableBody>
      {React.Children.map(props.children, (child) => {
        // If the child is not a valid element or if it isn't a table row component, return
        // unchanged
        if (!React.isValidElement(child) || child.type !== Table.Row) return child;
        
        // Augment the row index
        const index = rowIndex++;
        return React.cloneElement<TableRowProps>(child, {
          _isHeaderRow: false,
          _onChange: (checked: boolean) => toggleRowSelection(index, checked),
          _selected: selections.has(index),
          _disableSelect: disableSelect(data[index])
        });
      })}
    </MuiTableBody>
  );
};

const TableHead: TableHead = (props) => {
  const { allSelected, data, toggleAllSelections, disableSelect } = React.useContext(TableContext);
  const selectables = data.filter(d => !disableSelect(d));
  return (
    <MuiTableHead>
      {React.isValidElement(props.children)
        ? React.cloneElement<TableRowProps>(props.children, {
          _isHeaderRow: true,
          _onChange: toggleAllSelections,
          _selected: allSelected,
          _disableSelect: selectables.length === 0
        })
        : props.children
      }
    </MuiTableHead>
  );
};

const TableRow: TableRow = (props) => {
  const { children, className, _disableSelect, _isHeaderRow, _onChange, _selected } = props;
  const { selectable } = React.useContext(TableContext);
  
  // If the row is selectable, add in a checkbox to the front of the row
  let checkboxCell = null;
  let colIndex = 0;
  if (selectable) {
    // The `onChange` callback depends on the cell's context
    checkboxCell = (
      <Table.Cell _columnIndex={colIndex++} _isHeaderRow={_isHeaderRow}>
        <Checkbox checked={_selected} disabled={_disableSelect} onChange={_onChange} />
      </Table.Cell>
    );
  }
  
  return (
    <MuiTableRow className={className}>
      {checkboxCell}
      {React.Children.map(children, child =>
        // Add the `_columnIndex` and `_isHeaderRow` props
        React.isValidElement(child)
          ? React.cloneElement(child, { _columnIndex: colIndex++, _isHeaderRow })
          : null
      )}
    </MuiTableRow>
  );
};

const TableCell: TableCell = (props) => {
  const { sortBy, sortDir, _columnIndex, _isHeaderRow, ...rest } = props;
  const tableCellProps = { ...rest };
  const { setSortState, sortState } = React.useContext(TableContext);
  
  // For accessibility, a table's first column is set to be a <th> element, with a scope of "row",
  // and table header elements are given a scope of "col". This enables screen readers to identify a
  // cell's value by its row and column name.
  //
  // See more here: https://material-ui.com/components/tables/#structure
  if (_columnIndex === 0 || _isHeaderRow) {
    Object.assign(tableCellProps, {
      component: 'th',
      scope: _isHeaderRow ? 'col' : 'row'
    });
  }
  
  if (sortBy) {
    const active = sortBy === sortState?.key;
    return (
      <MuiTableCell {...omit(tableCellProps, 'children')}>
        <MuiTableSortLabel
          active={active}
          direction={active ? sortState?.dir : getDefaultSortDir()}
          onClick={updateSortState}
        >
          {rest.children}
        </MuiTableSortLabel>
      </MuiTableCell>
    );
  }
  
  return <MuiTableCell {...tableCellProps} />;
  
  /** ============================ Callbacks =============================== */
  /**
   * Triggered when the user clicks the sort label, indicating they want to sort on a given column
   */
  function updateSortState () {
    const newDir = sortState?.key === sortBy
      ? toggleSortDir(sortState?.dir)
      : getDefaultSortDir();
    
    setSortState({
      dir: newDir,
      // `sortBy` isn't a required column, but is required for rendering the sort label and thus
      // for triggering this callback, hence the non-null assertion
      key: sortBy!
    });
  }
  
  /**
   * Returns the column's default sorting direction, falling back on the global default sort
   * direction if no sort direction is provided
   */
  function getDefaultSortDir () {
    return sortDir || DEFAULT_SORT_DIR;
  }
  
  /**
   * Toggles sort direction from ascending to descending or vice versa. If not provided an initial
   * direction, returns the global default sorting direction
   *
   * @param {'asc' | 'desc'} [dir]: initial sort direction
   */
  function toggleSortDir (dir?: SortState['dir']) {
    switch (dir) {
      case 'asc': return 'desc';
      case 'desc': return 'asc';
      default: return DEFAULT_SORT_DIR;
    }
  }
};

/** ============================ Exports =================================== */
Table.Body = TableBody;
Table.Cell = TableCell;
Table.Head = TableHead;
Table.Pagination = TablePagination;
Table.Row = TableRow;

/** ============================ Constants ================================= */
const DEFAULT_SORT_DIR = 'asc';
