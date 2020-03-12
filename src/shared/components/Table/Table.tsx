import * as React from 'react';
import pick from 'lodash/pick';
import MuiPaper from '@material-ui/core/Paper';
import MuiTable from '@material-ui/core/Table';
import MuiTableBody from '@material-ui/core/TableBody';
import MuiTableCell from '@material-ui/core/TableCell';
import MuiTableContainer from '@material-ui/core/TableContainer';
import MuiTableHead from '@material-ui/core/TableHead';
import MuiTableRow from '@material-ui/core/TableRow';

import { Flex, Progress, Typography } from '@nav/shared/components';
import { makeStylesHook } from '@nav/shared/styles';
import { PaginationSet } from '@nav/shared/types';
import { TablePagination, TableState } from './Pagination';
import { makeCancelableAsync } from '../../util';


/** ============================ Types ===================================== */
type TableProps<T> = React.TableHTMLAttributes<HTMLTableElement> & {
  children: (data: T[]) => React.ReactNode;
  containerClassName?: string;
  dataFn: (state: TableState) => Promise<PaginationSet<T>>;
  raised?: boolean;
  stickyHeader?: boolean;
  title?: string;
};

type TableCellProps = {
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  // For accessibility, a table's first column is set to be a <th> element, with a scope of "row".
  // This enables screen readers to identify a cell's value by its row and column name.
  useTh?: boolean;
};

type TableBodyProps = {};
type TableHeadProps = {};
type TableRowProps = {};

type TableBody = React.FC<TableBodyProps>;
type TableCell = React.FC<TableCellProps>;
type TableHead = React.FC<TableHeadProps>;
type TableRow = React.FC<TableRowProps>;

type DataState<T> = {
  data: T[] | null;
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
export function Table <T>(props: TableProps<T>) {
  const { children, dataFn, containerClassName, raised, title, ...rest } = props;
  const classes = useStyles();
  
  // State
  const [loading, setLoading] = React.useState(true);
  const [dataState, setDataState] = React.useState<DataState<T>>({
    data: null,
    count: null
  });
  const [tableState, setTableState] = React.useState<TableState>({
    currentPage: 0,
    rowsPerPage: 20
  });
  
  const { data, count } = dataState;
  const { currentPage, rowsPerPage } = tableState;
  
  // Load data
  React.useEffect(makeCancelableAsync(() => {
    setLoading(true);
    return dataFn(tableState)
  }, (paginationSet) => {
    setLoading(false);
    setDataState(pick(paginationSet, 'data', 'count'));
  }), [dataFn, tableState]);

  return (
    <div>
      <Flex.Container alignItems="center" className={classes.header} justifyContent="space-between">
        <Typography variant="h6">{title}</Typography>
        {data && count && (
          <TablePagination
            count={count}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            updateTableState={updateTableState}
          />
        )}
      </Flex.Container>
      <MuiTableContainer className={containerClassName} component={raised ? TableRaiser : MuiPaper}>
        <MuiTable {...rest}>
          {children(data || [])}
        </MuiTable>
      </MuiTableContainer>
      {loading ? <Progress /> : <div className={classes.progressBarSpacer} />}
    </div>
  );
  
  /** ============================ Callbacks =============================== */
  function updateTableState (newState: TableState) {
    setTableState(newState);
  }
}

const TableBody: TableBody = props => <MuiTableBody {...props} />;
const TableHead: TableHead = props => <MuiTableHead {...props} />;
const TableRow: TableRow = props => <MuiTableRow {...props} />;
const TableCell: TableCell = ({ useTh, ...rest }) => {
  const tableProps = { ...rest };
  
  if (useTh) {
    Object.assign(tableProps, {
      component: 'th',
      scope: 'row'
    });
  }
  
  return <MuiTableCell {...tableProps} />;
};

Table.defaultProps = {
  raised: false
};

TableCell.defaultProps = {
  useTh: false
};

/** ============================ Exports =================================== */
Table.Body = TableBody;
Table.Cell = TableCell;
Table.Head = TableHead;
Table.Pagination = TablePagination;
Table.Row = TableRow;
