import * as React from 'react';
import { useDispatch } from 'react-redux';

import * as api from 'navigader/api';
import { Table, PaginationState } from 'navigader/components';
import { slices } from 'navigader/store';
import { makeStylesHook } from 'navigader/styles';
import { MeterGroup } from 'navigader/types';


/** ============================ Types ===================================== */
type MetersTableProps = {
  meterGroupId: MeterGroup['id'];
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(() => ({
  tableContainer: {
    maxHeight: 500
  }
}), 'MetersTable');

/** ============================ Components ================================ */
const MetersTable: React.FC<MetersTableProps> = ({ meterGroupId }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  
  const getMeters = React.useCallback(
    async (state: PaginationState) => {
      const response = await api.getMeters({
        meterGroupId,
        page: state.currentPage + 1,
        page_size: state.rowsPerPage
      });
      
      // Add the models to the store and yield the pagination results
      dispatch(slices.models.updateModels(response.data));
      return response;
    },
    [meterGroupId, dispatch]
  );
  
  // TODO: virtualize the table
  return (
    <Table
      aria-label="meter table"
      dataFn={getMeters}
      dataSelector={slices.models.selectMeters}
      containerClassName={classes.tableContainer}
      raised
      stickyHeader
      title="Meters"
    >
      {meters =>
        <>
          <Table.Head>
            <Table.Row>
              <Table.Cell>SA ID</Table.Cell>
              <Table.Cell>Rate Plan</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {meters.map(meter =>
              <Table.Row key={meter.id}>
                <Table.Cell>{meter.metadata.sa_id}</Table.Cell>
                <Table.Cell>{meter.metadata.rate_plan_name}</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </>
      }
    </Table>
  );
};

/** ============================ Exports =================================== */
export default MetersTable;
