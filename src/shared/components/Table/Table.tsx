import * as React from 'react';
import isEmpty from 'lodash/isEmpty';
import MuiPaper from '@material-ui/core/Paper';
import MuiTable from '@material-ui/core/Table';
import MuiTableBody from '@material-ui/core/TableBody';
import MuiTableCell from '@material-ui/core/TableCell';
import MuiTableContainer from '@material-ui/core/TableContainer';
import MuiTableHead from '@material-ui/core/TableHead';
import MuiTableRow from '@material-ui/core/TableRow';

import { PaginationSet } from '@nav/shared/api/util';
import { Checkbox, Flex, Progress, Typography } from '@nav/shared/components';
import { RootState } from '@nav/shared/store';
import { makeStylesHook } from '@nav/shared/styles';
import { IdType, ObjectWithId} from '@nav/shared/types';
import { hooks, makeCancelableAsync } from '@nav/shared/util';
import { TablePagination } from './Pagination';
import { PaginationState, TableContext } from './util';


/** ============================ Types ===================================== */
type EmptyRowProps = React.PropsWithChildren<{
  colSpan: number;
}>;

type TableProps<T extends ObjectWithId> = {
  children: (data: T[], emptyRow: React.FC<EmptyRowProps>) => React.ReactElement;
  containerClassName?: string;
  dataFn: (state: PaginationState) => Promise<PaginationSet<T>>;
  dataSelector: (state: RootState) => T[];
  ifEmpty?: React.ReactNode;
  onSelect?: (selections: T[]) => void;
  raised?: boolean;
  stickyHeader?: boolean;
  title?: string;
};

type TableCellProps = {
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  colSpan?: number;
  // For accessibility, a table's first column is set to be a <th> element, with a scope of "row".
  // This enables screen readers to identify a cell's value by its row and column name.
  useTh?: boolean;
};

type TableHeadProps = {};
type TableBodyProps = {};

type TableRowProps = {
  // These props should be provided manually-- they are provided by the `TableHead` and `TableBody`
  // components
  _selected?: boolean;
  _onChange?: (checked: boolean) => void;
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
}));

/** ============================ Components ================================ */
const TableRaiser: React.FC = (props) => <MuiPaper elevation={8} {...props} />;
export function Table <T extends ObjectWithId>(props: TableProps<T>) {
  const {
    children,
    dataFn,
    dataSelector,
    containerClassName,
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
  
  // Load data
  React.useEffect(makeCancelableAsync(() => {
    setLoading(true);
    return dataFn(paginationState)
  }, (paginationSet) => {
    setLoading(false);
    setDataState({
      count: paginationSet.count,
      dataIds: paginationSet.data.map(datum => datum.id)
    });
  }), [dataFn, paginationState]);
  
  // Get the data from the store using the IDs
  const { dataIds, count } = dataState;
  const data = hooks.useTableSelector(dataSelector, dataIds);
  
  // Build context for child component tree
  const loadedData = !loading && !isEmpty(data);
  const tableContext = {
    allSelected: data.length > 0 && data.length === selections.size,
    selectable: Boolean(onSelect) && loadedData,
    selections: selections,
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
      updateSelections(new Set(data.map((d, i) => i)));
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
  const { selections, toggleRowSelection } = React.useContext(TableContext);
  
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
          _onChange: (checked: boolean) => toggleRowSelection(index, checked),
          _selected: selections.has(index)
        });
      })}
    </MuiTableBody>
  );
};

const TableHead: TableHead = (props) => {
  const { allSelected, toggleAllSelections } = React.useContext(TableContext);
  return (
    <MuiTableHead>
      {React.isValidElement(props.children)
        ? React.cloneElement<TableRowProps>(props.children, {
          _onChange: toggleAllSelections,
          _selected: allSelected
        })
        : props.children
      }
    </MuiTableHead>
  );
};

const TableRow: TableRow = (props) => {
  const { children, _selected, _onChange } = props;
  const { selectable } = React.useContext(TableContext);
  
  // If the row is selectable, add in a checkbox to the front of the row
  let checkboxCell = null;
  if (selectable) {
    // The `onChange` callback depends on the cell's context
    checkboxCell = (
      <Table.Cell>
        <Checkbox checked={_selected} onChange={_onChange} />
      </Table.Cell>
    );
  }
  
  return (
    <MuiTableRow>
      {checkboxCell}
      {children}
    </MuiTableRow>
  );
};

const TableCell: TableCell = ({ useTh = false, ...rest }) => {
  const tableProps = { ...rest };
  
  if (useTh) {
    Object.assign(tableProps, {
      component: 'th',
      scope: 'row'
    });
  }
  
  return <MuiTableCell {...tableProps} />;
};

/** ============================ Exports =================================== */
Table.Body = TableBody;
Table.Cell = TableCell;
Table.Head = TableHead;
Table.Pagination = TablePagination;
Table.Row = TableRow;
