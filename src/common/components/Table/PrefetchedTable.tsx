import * as React from 'react';

import { ObjectWithId } from 'navigader/types';
import { _ } from 'navigader/util';
import { Table, TableProps } from './Table';
import { PaginationState, SortState } from './util';


/** ============================ Types ===================================== */
type PrefetchedTableProps<T extends ObjectWithId> =
  Omit<TableProps<T>, 'dataFn' | 'dataSelector'> &
  {
    data: T[]
  };


/** ============================ Components ================================ */
export function PrefetchedTable <T extends ObjectWithId>(props: PrefetchedTableProps<T>) {
  const { data, ...rest } = props;
  return (
    <Table
      dataFn={state => Promise.resolve({
        count: data.length,
        data: getDataPage(data, state)
      })}
      dataSelector={() => data}
      {...rest}
    />
  );
}

function getDataPage (data: any[], state: PaginationState & Partial<SortState>) {
  const { currentPage, dir, key, rowsPerPage } = state;
  let sorted = data;
  if (key) {
    // `sortBy` sorts in ascending order by default
    sorted = _.sortBy(data, [key]);
    if (dir === 'desc') sorted.reverse();
  }
  
  return sorted.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);
}
