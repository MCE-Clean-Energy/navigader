import * as React from 'react';
import MuiPaper from '@material-ui/core/Paper';
import MuiTable from '@material-ui/core/Table';
import MuiTableBody from '@material-ui/core/TableBody';
import MuiTableCell from '@material-ui/core/TableCell';
import MuiTableContainer from '@material-ui/core/TableContainer';
import MuiTableHead from '@material-ui/core/TableHead';
import MuiTableRow from '@material-ui/core/TableRow';
import MuiTableSortLabel from '@material-ui/core/TableSortLabel';
import MuiToolbar from '@material-ui/core/Toolbar';

import { RootState } from 'navigader/store';
import { makeStylesHook, white } from 'navigader/styles';
import { IdType, ObjectWithId, PaginationSet } from 'navigader/types';
import { makeCancelableAsync } from 'navigader/util';
import { useTableSelector } from 'navigader/util/hooks';
import { Checkbox } from '../Checkbox';
import * as Flex from '../Flex';
import { Progress } from '../Progress';
import { Typography } from '../Typography';
import { TablePagination } from './Pagination';
import { DisabledSelectComponent, PaginationState, SortState, TableContext } from './util';


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
  DisabledSelectComponent?: DisabledSelectComponent<T>;
  headerActions?: React.ReactNode;
  hover?: boolean;
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

type TableRowProps<T extends ObjectWithId> = React.PropsWithChildren<{
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;

  // These props should not be provided by consuming components-- they are provided by the
  // `TableHead` and `TableBody` components
  _datum?: T;
  _disableSelect?: boolean;
  _isHeaderRow?: boolean;
  _onChange?: (checked: boolean) => void;
  _selected?: boolean;
}>;

type DataState = {
  dataIds: IdType[] | null;
  count: number | null;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  progressBarSpacer: {
    height: 4
  },
  table: {
    '& .disabled-select-component': {
      display: 'flex',
      flexFlow: 'row nowrap',
      justifyContent: 'center',
      width: '100%'
    }
  },
  toolbar: {
    justifyContent: 'space-between',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1)
  }
}), 'NavigaderTable');

const useTableCellStyles = makeStylesHook(() => ({
  stickyHeader: {
    backgroundColor: white,
  }
}), 'NavigaderTableCell');

/** ============================ Components ================================ */
export function Table <T extends ObjectWithId>(props: TableProps<T>) {
  const {
    children,
    containerClassName,
    dataFn,
    dataSelector,
    disableSelect = () => false,
    DisabledSelectComponent,
    headerActions,
    hover = true,
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
    return dataFn({ ...paginationState, ...sortState });
  }, (paginationSet) => {
    setLoading(false);
    setDataState({
      count: paginationSet.count,
      dataIds: paginationSet.data.map(datum => datum.id)
    });
  }), [dataFn, paginationState, sortState]);

  // Get the data from the store using the IDs
  const { dataIds, count } = dataState;
  const data = useTableSelector(dataSelector, dataIds);

  // Build context for child component tree
  const selectables = data.filter(d => !disableSelect(d));
  const tableContext = {
    allSelected: selectables.length > 0 && selectables.length === selections.size,
    data,
    disableSelect,
    DisabledSelectComponent,
    hover,
    selectable: Boolean(onSelect),
    selections,
    setSortState,
    sortState,
    toggleAllSelections,
    toggleRowSelection
  };

  return (
    <MuiPaper elevation={raised ? 8 : 0}>
      <MuiToolbar className={classes.toolbar}>
        <Typography variant="h6">{title}</Typography>
        {data &&
          <Flex.Container alignItems="center">
            {headerActions}
            {(count !== null && count > 10) &&
              <TablePagination
                count={count}
                paginationState={paginationState}
                updatePaginationState={updatePaginationState}
              />
            }
          </Flex.Container>
        }
      </MuiToolbar>
      <MuiTableContainer className={containerClassName}>
        <MuiTable className={classes.table} {...rest}>
          <TableContext.Provider value={tableContext}>
            {children(data || [], EmptyRow)}
          </TableContext.Provider>
        </MuiTable>
      </MuiTableContainer>
      {loading && <Progress />}
    </MuiPaper>
  );

  /** ========================== Callbacks ================================= */
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

const TableBody: React.FC = (props) => {
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
        const datum = data[index];
        return React.cloneElement<TableRowProps<ObjectWithId>>(child, {
          _datum: datum,
          _isHeaderRow: false,
          _onChange: (checked: boolean) => toggleRowSelection(index, checked),
          _selected: selections.has(index),
          _disableSelect: disableSelect(datum)
        });
      })}
    </MuiTableBody>
  );
};

const TableHead: React.FC = (props) => {
  const { allSelected, data, toggleAllSelections, disableSelect } = React.useContext(TableContext);
  const selectables = data.filter(d => !disableSelect(d));
  return (
    <MuiTableHead>
      {React.isValidElement(props.children)
        ? React.cloneElement<TableRowProps<never>>(props.children, {
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

function TableRow<T extends ObjectWithId> (props: TableRowProps<T>) {
  const {
    children,
    className,
    onMouseEnter,
    onMouseLeave,
    _datum,
    _disableSelect,
    _isHeaderRow,
    _onChange,
    _selected
  } = props;
  const { DisabledSelectComponent, hover, selectable } = React.useContext(TableContext);

  // If the row is selectable, add in a checkbox to the front of the row
  let checkboxCell = null;
  let colIndex = 0;
  if (selectable) {
    // The `onChange` callback depends on the cell's context
    checkboxCell = (
      <Table.Cell _columnIndex={colIndex++} _isHeaderRow={_isHeaderRow}>
        {_disableSelect && !_isHeaderRow && DisabledSelectComponent
          ? (
            <div className="disabled-select-component">
              <DisabledSelectComponent datum={_datum} />
            </div>
          ) : <Checkbox checked={_selected} disabled={_disableSelect} onChange={_onChange} />
        }
      </Table.Cell>
    );
  }

  return (
    <MuiTableRow
      className={className}
      hover={hover && !_isHeaderRow}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {checkboxCell}
      {React.Children.map(children, child =>
        // Add the `_columnIndex` and `_isHeaderRow` props
        React.isValidElement(child)
          ? React.cloneElement(child, { _columnIndex: colIndex++, _isHeaderRow })
          : null
      )}
    </MuiTableRow>
  );
}

const TableCell: React.FC<TableCellProps> = (props) => {
  const { children, sortBy, sortDir, _columnIndex, _isHeaderRow, ...rest } = props;
  const { setSortState, sortState } = React.useContext(TableContext);
  const classes = useTableCellStyles();
  const tableCellProps = { classes, ...rest };

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
      <MuiTableCell {...tableCellProps}>
        <MuiTableSortLabel
          active={active}
          direction={active ? sortState?.dir : getDefaultSortDir()}
          onClick={updateSortState}
        >
          {children}
        </MuiTableSortLabel>
      </MuiTableCell>
    );
  }

  return <MuiTableCell children={children} {...tableCellProps} />;

  /** ========================== Callbacks ================================= */
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
