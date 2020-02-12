import React from 'react';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';


/** ============================ Types ===================================== */
type NavigaderTableProps = React.TableHTMLAttributes<HTMLTableElement> & {
  containerClassName?: string;
  raised?: boolean;
  stickyHeader?: boolean;
};

type NavigaderTableCellProps = {
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  // For accessibility, a table's first column is set to be a <th> element, with a scope of "row".
  // This enables screen readers to identify a cell's value by its row and column name.
  useTh?: boolean;
};

type NavigaderTableBodyProps = {};
type NavigaderTableHeadProps = {};
type NavigaderTableRowProps = {};

type NavigaderTableBody = React.FC<NavigaderTableBodyProps>;
type NavigaderTableCell = React.FC<NavigaderTableCellProps>;
type NavigaderTableHead = React.FC<NavigaderTableHeadProps>;
type NavigaderTableRow = React.FC<NavigaderTableRowProps>;

type NavigaderTableExport = React.FC<NavigaderTableProps> & {
  Body: NavigaderTableBody;
  Cell: NavigaderTableCell;
  Head: NavigaderTableHead;
  Row: NavigaderTableRow;
};

/** ============================ Components ================================ */
const TableRaiser: React.FC = (props) => <Paper elevation={8} {...props} />;
const NavigaderTable: NavigaderTableExport = ({ containerClassName, raised, ...rest }) =>
  <TableContainer className={containerClassName} component={raised ? TableRaiser : Paper}>
    <Table {...rest} />
  </TableContainer>;

const NavigaderTableBody: NavigaderTableBody = props => <TableBody {...props} />;
const NavigaderTableHead: NavigaderTableHead = props => <TableHead {...props} />;
const NavigaderTableRow: NavigaderTableRow = props => <TableRow {...props} />;
const NavigaderTableCell: NavigaderTableCell = ({ useTh, ...rest }) => {
  const tableProps = { ...rest };
  
  if (useTh) {
    Object.assign(tableProps, {
      component: 'th',
      scope: 'row'
    });
  }
  
  return <TableCell {...tableProps} />;
};

NavigaderTable.defaultProps = {
  raised: false
};

NavigaderTableCell.defaultProps = {
  useTh: false
};

/** ============================ Exports =================================== */
NavigaderTable.Body = NavigaderTableBody;
NavigaderTable.Cell = NavigaderTableCell;
NavigaderTable.Head = NavigaderTableHead;
NavigaderTable.Row = NavigaderTableRow;

export default NavigaderTable;
