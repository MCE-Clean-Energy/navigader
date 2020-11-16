import _ from 'lodash';
import * as React from 'react';

import { ObjectWithId, PaginationQueryParams, TableProps } from 'navigader/types';
import { Table } from './Table';

/** ============================ Types ===================================== */
type PrefetchedTableProps<T extends ObjectWithId> = Omit<
  TableProps<T>,
  'dataFn' | 'dataSelector'
> & { data: T[] };

/** ============================ Components ================================ */
export function PrefetchedTable<T extends ObjectWithId>(props: PrefetchedTableProps<T>) {
  const { data, ...rest } = props;
  return (
    <Table
      dataFn={(queryParams) =>
        Promise.resolve({
          count: data.length,
          data: getDataPage(data, queryParams),
        })
      }
      dataSelector={() => data}
      {...rest}
    />
  );
}

function getDataPage(data: any[], state: PaginationQueryParams) {
  const { page, pageSize, sortDir, sortKey } = state;
  let sorted = data;
  if (sortKey) {
    // `sortBy` sorts in ascending order by default
    sorted = _.sortBy(data, [sortKey]);
    if (sortDir === 'desc') sorted.reverse();
  }

  return sorted.slice(page * pageSize, (page + 1) * pageSize);
}
