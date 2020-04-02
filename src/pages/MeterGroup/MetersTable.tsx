import * as React from 'react';
import { useDispatch } from 'react-redux';

import * as api from '@nav/shared/api';
import { Table, PaginationState } from '@nav/shared/components';
import { Meter, MeterGroup } from '@nav/shared/models/meter';
import { selectModels, setModels } from '@nav/shared/store/slices/models';
import { makeStylesHook } from '@nav/shared/styles';
import { PaginationSet } from '@nav/shared/types';


/** ============================ Types ===================================== */
type MetersTableProps = {
  meterGroupId: MeterGroup['id'];
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(() => ({
  tableContainer: {
    maxHeight: 500
  }
}));

/** ============================ Components ================================ */
const MetersTable: React.FC<MetersTableProps> = ({ meterGroupId }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  
  const getMeters = React.useCallback(
    async (state: PaginationState): Promise<PaginationSet<Meter>> => {
      const response = await api.getMeters({
        meterGroupId,
        page: state.currentPage + 1,
        pageSize: state.rowsPerPage
      });
      
      // Add the models to the store and yield the pagination results
      dispatch(setModels({ meters: response.data }));
      return response;
    },
    [meterGroupId, dispatch]
  );
  
  // TODO: virtualize the table
  return (
    <Table
      aria-label="meter table"
      dataFn={getMeters}
      dataSelector={selectModels('meters')}
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
                <Table.Cell useTh>{meter.metadata.sa_id}</Table.Cell>
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
