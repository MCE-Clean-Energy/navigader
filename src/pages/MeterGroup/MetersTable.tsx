import React from 'react';
import { createUseStyles } from 'react-jss';

import * as api from '@nav/shared/api';
import { Table, TableState } from '@nav/shared/components';
import { Meter, MeterGroup } from '@nav/shared/models/meter';
import { Theme } from '@nav/shared/styles';
import { PaginationSet } from '@nav/shared/types';


/** ============================ Types ===================================== */
type MetersTableProps = {
  meterGroupId: MeterGroup['id'];
};

/** ============================ Styles ==================================== */
const useStyles = createUseStyles((theme: Theme) => ({
  tableContainer: {
    maxHeight: 500
  }
}));

/** ============================ Components ================================ */
const MetersTable: React.FC<MetersTableProps> = ({ meterGroupId }) => {
  const classes = useStyles();
  
  // TODO: virtualize the table
  return (
    <Table
      aria-label="meter table"
      dataFn={getMeters}
      containerClassName={classes.tableContainer}
      raised
      stickyHeader
      title="Meters"
    >
      {(meters) =>
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
                <Table.Cell useTh>{meter.metaData.saId}</Table.Cell>
                <Table.Cell>{meter.metaData.ratePlan}</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </>
      }
    </Table>
  );
  
  async function getMeters (state: TableState): Promise<PaginationSet<Meter>> {
    return await api.getMeters({
      meterGroupId,
      page: state.currentPage + 1,
      pageSize: state.rowsPerPage,
      types: 'default'
    });
  }
};

/** ============================ Exports =================================== */
export default MetersTable;
