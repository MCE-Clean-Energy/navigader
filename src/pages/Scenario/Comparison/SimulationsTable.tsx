import * as React from 'react';

import { PrefetchedTable, Table } from '@nav/common/components';
import { ScenarioReportFields } from '@nav/common/models/scenario';
import { formatters } from '@nav/common/util';


/** ============================ Types ===================================== */
type SimulationsTableProps = {
  simulations: ScenarioReportFields[]
};

/** ============================ Components ================================ */
export const SimulationsTable: React.FC<SimulationsTableProps> = ({ simulations }) => {
  return (
    <PrefetchedTable
      aria-label="simulations table"
      // Give the simulation an ID that is a combination of the meter ID and the scenario ID
      data={simulations.map(s => ({ ...s, id: s.ID + s.SingleScenarioStudy }))}
      initialSorting={{
        dir: 'desc',
        key: 'UsageDelta'
      }}
      raised
      stickyHeader
      title="Simulations"
    >
      {(simulations) =>
        <>
          <Table.Head>
            <Table.Row>
              <Table.Cell>SA ID</Table.Cell>
              <Table.Cell>Rate Plan</Table.Cell>
              <Table.Cell align="right" sortBy="UsageDelta" sortDir="desc">Usage Delta (kWh)</Table.Cell>
              <Table.Cell align="right" sortBy="BillDelta">Bill Delta ($)</Table.Cell>
              <Table.Cell align="right" sortBy="CleanNetShort2022Delta">
                <span>CNS 2022 Delta (tCO<sub>2</sub>)</span>
              </Table.Cell>
              <Table.Cell align="right" sortBy="RADelta">RA System Peak Delta (kW)</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {simulations.map(simulation =>
              <Table.Row key={simulation.id}>
                <Table.Cell>{simulation.SA_ID}</Table.Cell>
                <Table.Cell>{simulation.MeterRatePlan}</Table.Cell>
                <Table.Cell align="right">{formatters.maxDecimals(simulation.UsageDelta, 2)}</Table.Cell>
                <Table.Cell align="right">{formatters.maxDecimals(simulation.BillDelta, 2)}</Table.Cell>
                <Table.Cell align="right">{formatters.maxDecimals(simulation.CleanNetShort2022Delta, 2)}</Table.Cell>
                <Table.Cell align="right">{formatters.maxDecimals(simulation.RADelta, 2)}</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </>
      }
    </PrefetchedTable>
  );
};
