import _ from 'lodash';
import * as React from 'react';

import { OriginFile } from 'navigader/types';
import { formatters } from 'navigader/util';

import { StandardDate } from '../Date';
import { PrefetchedTable, Table } from '../Table';

/** ============================ Types ===================================== */
type SummaryTableProps = {
  originFile: OriginFile;
};

/** ============================ Components ================================ */
export const SummaryTable: React.FC<SummaryTableProps> = ({ originFile }) => {
  const {
    created_at,
    date_range,
    max_monthly_demand,
    meter_count,
    total_kwh,
    total_therms,
  } = originFile;
  const showTherms = originFile.has_gas && _.isNumber(originFile.total_therms);
  return (
    <PrefetchedTable data={[]} hover={false} size="small">
      {() => (
        <Table.Body>
          <Table.Row>
            <Table.Cell>Uploaded</Table.Cell>
            <Table.Cell>
              <StandardDate date={created_at} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell># Meters</Table.Cell>
            <Table.Cell>{meter_count}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Date range</Table.Cell>
            <Table.Cell>
              <StandardDate.Range range={date_range} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Total kWh</Table.Cell>
            <Table.Cell>{formatters.commas(formatters.maxDecimals(total_kwh, 2))}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Max monthly demand</Table.Cell>
            <Table.Cell>
              {formatters.commas(formatters.maxDecimals(max_monthly_demand, 2))} kW
            </Table.Cell>
          </Table.Row>
          {showTherms && (
            <Table.Row>
              <Table.Cell>Total therms</Table.Cell>
              <Table.Cell>{formatters.commas(formatters.maxDecimals(total_therms, 2))}</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      )}
    </PrefetchedTable>
  );
};
