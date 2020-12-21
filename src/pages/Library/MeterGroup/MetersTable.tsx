import * as React from 'react';

import * as api from 'navigader/api';
import { TableFactory } from 'navigader/components';
import { slices } from 'navigader/store';
import { makeStylesHook } from 'navigader/styles';
import { Meter, OriginFile } from 'navigader/types';
import { formatters } from 'navigader/util';

/** ============================ Types ===================================== */
type MetersTableProps = {
  originFile: OriginFile;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(
  () => ({
    tableContainer: {
      maxHeight: 500,
    },
  }),
  'MetersTable'
);

/** ============================ Components ================================ */
const Table = TableFactory<Meter>();

const MetersTable: React.FC<MetersTableProps> = ({ originFile }) => (
  <Table
    aria-label="meter table"
    dataFn={(params) => api.getMeters({ meterGroupId: originFile.id, ...params })}
    dataSelector={slices.models.selectMeters}
    containerClassName={useStyles().tableContainer}
    raised
    title="Meters"
  >
    {(meters) => (
      <>
        <Table.Head>
          <Table.Row>
            <Table.Cell>SA ID</Table.Cell>
            <Table.Cell>Rate Plan</Table.Cell>
            <Table.Cell align="right">Maximum Monthly Demand (kW)</Table.Cell>
            <Table.Cell align="right">Total kWh</Table.Cell>
            {originFile.has_gas && <Table.Cell align="right">Total Therms</Table.Cell>}
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {meters.map((meter) => (
            <Table.Row key={meter.id}>
              <Table.Cell>{meter.metadata.sa_id}</Table.Cell>
              <Table.Cell>{meter.metadata.rate_plan_name}</Table.Cell>
              <Table.Cell align="right">
                {formatters.commas(formatters.maxDecimals(meter.max_monthly_demand, 2))}
              </Table.Cell>
              <Table.Cell align="right">
                {formatters.commas(formatters.maxDecimals(meter.total_kwh, 2))}
              </Table.Cell>
              {originFile.has_gas && (
                <Table.Cell align="right">
                  {formatters.commas(formatters.maxDecimals(meter.total_therms, 2)) ?? '-'}
                </Table.Cell>
              )}
            </Table.Row>
          ))}
        </Table.Body>
      </>
    )}
  </Table>
);

/** ============================ Exports =================================== */
export default MetersTable;
