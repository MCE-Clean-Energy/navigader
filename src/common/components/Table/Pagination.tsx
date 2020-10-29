import * as React from 'react';
import MuiTablePagination from '@material-ui/core/TablePagination';

import { PaginationFields, PageSizeOption } from 'navigader/types';

/** ============================ Types ===================================== */
type TablePaginationProps = {
  // The number of data in the full table; this is used to show the count
  count: number | null;
  paginationState: PaginationFields;
  updatePaginationState: (state: PaginationFields) => void;
};

/** ============================ Components ================================ */
export const TablePagination: React.FC<TablePaginationProps> = (props) => {
  const { count, paginationState, updatePaginationState } = props;
  const { page, pageSize } = paginationState;

  if (count === null || count === 0) {
    return null;
  }

  return (
    <MuiTablePagination
      component="div"
      count={count}
      data-testid="table-pagination"
      onChangePage={changePage}
      onChangeRowsPerPage={changeRowsPerPage}
      page={page}
      rowsPerPage={pageSize}
      rowsPerPageOptions={[10, 20, 50, 100]}
    />
  );

  function changeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
    updatePaginationState({
      page: 0,
      pageSize: +event.target.value as PageSizeOption,
    });
  }

  function changePage(event: React.MouseEvent<HTMLButtonElement> | null, page: number) {
    updatePaginationState({ page, pageSize });
  }
};
