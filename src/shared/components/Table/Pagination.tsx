import * as React from 'react';
import MuiTablePagination from '@material-ui/core/TablePagination';

import { RowsPerPageOption } from '@nav/shared/api/util';
import { PaginationState } from './util';


/** ============================ Types ===================================== */
type TablePaginationProps = {
  // The number of data in the full table; this is used to show the count
  count: number | null;
  paginationState: PaginationState;
  updatePaginationState: (state: PaginationState) => void;
};

/** ============================ Components ================================ */
export const TablePagination: React.FC<TablePaginationProps> = (props) => {
  const { count, paginationState, updatePaginationState } = props;
  const { currentPage, rowsPerPage } = paginationState;
  
  if (count === null || count === 0) {
    return null;
  }
  
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
    updatePaginationState({
      currentPage: 0,
      rowsPerPage: +event.target.value as RowsPerPageOption,
    });
  }
  
  function changePage (event: React.MouseEvent<HTMLButtonElement> | null, page: number) {
    updatePaginationState({
      currentPage: page,
      rowsPerPage,
    });
  }
};
