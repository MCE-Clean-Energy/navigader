import React from 'react';
import MuiTablePagination from '@material-ui/core/TablePagination';

import { RowsPerPageOption } from '@nav/shared/types';


/** ============================ Types ===================================== */
export type TableState = {
  currentPage: number;
  rowsPerPage: RowsPerPageOption;
};

type TablePaginationProps = TableState & {
  // The number of data in the full table; this is used to show the count
  count: number;
  updateTableState: (state: TableState) => void;
};

/** ============================ Components ================================ */
export const TablePagination: React.FC<TablePaginationProps> = (props) => {
  const { count, currentPage, rowsPerPage, updateTableState } = props;
  
  return (
    <MuiTablePagination
      component="div"
      count={count}
      onChangePage={changePage}
      onChangeRowsPerPage={changeRowsPerPage}
      page={currentPage}
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={[10, 20, 50, 100]}
    />
  );
  
  function changeRowsPerPage (event: React.ChangeEvent<HTMLInputElement>) {
    updateTableState({
      currentPage: 0,
      rowsPerPage: +event.target.value as RowsPerPageOption
    });
  }
  
  function changePage (event: React.MouseEvent<HTMLButtonElement> | null, page: number) {
    updateTableState({
      currentPage: page,
      rowsPerPage
    });
  }
};
