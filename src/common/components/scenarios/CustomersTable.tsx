import * as React from 'react';

import * as api from 'navigader/api';
import { ColorMap } from 'navigader/styles';
import { Scenario, ScenarioReportFields } from 'navigader/types';
import { formatters } from 'navigader/util';
import _ from 'navigader/util/lodash';
import { Avatar } from '../Avatar';
import { FileDownload } from '../FileDownload';
import { PrefetchedTable, Table } from '../Table';
import { Tooltip } from '../Tooltip';


/** ============================ Types ===================================== */
type CustomersTableProps = {
  className?: string;
  colorMap?: ColorMap;
  scenarios: Scenario[];
  simulations: ScenarioReportFields[];
  updateHover?: (id?: string) => void;
};

/** ============================ Components ================================ */
export const CustomersTable: React.FC<CustomersTableProps> = (props) => {
  const { className, colorMap, scenarios, simulations, updateHover = () => {} } = props;
  const scenarioMap = _.groupBy(scenarios, 'id');
  return (
    <PrefetchedTable
      aria-label="customers table"
      containerClassName={className}
      // Give the simulation an ID that is a combination of the meter ID and the scenario ID
      data={simulations.map(s => ({ ...s, id: s.ID + s.SingleScenarioStudy }))}
      headerActions={
        <FileDownload downloadFn={cb => api.downloadCustomerData(_.map(scenarios, 'id'), cb)} />
      }
      initialSorting={{
        dir: 'desc',
        key: 'UsageDelta'
      }}
      raised
      stickyHeader
      title="Customers"
    >
      {(simulations) =>
        <>
          <Table.Head>
            <Table.Row>
              {colorMap && <Table.Cell />}
              <Table.Cell sortBy="SA_ID">SA ID</Table.Cell>
              <Table.Cell>Rate Plan</Table.Cell>
              <Table.Cell align="right" sortBy="UsageDelta" sortDir="desc">Usage Impact (kWh)</Table.Cell>
              <Table.Cell align="right" sortBy="CleanNetShort2022Delta">
                <Tooltip title="Calculated using CNS 2022 tables">
                  <div>GHG Impact (tCO<sub>2</sub>)</div>
                </Tooltip>
              </Table.Cell>
              <Table.Cell align="right" sortBy="BillRevenueDelta">Revenue Impact ($)</Table.Cell>
              <Table.Cell align="right" sortBy="PRC_LMPDelta">Procurement Cost ($)</Table.Cell>
              <Table.Cell align="right" sortBy="RADelta">RA Impact (kW)</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {simulations.map(simulation =>
              <Table.Row
                key={simulation.id}
                onMouseEnter={
                  () => updateHover([simulation.SingleScenarioStudy, simulation.ID].join('__'))
                }
                onMouseLeave={() => updateHover()}
              >
                {colorMap &&
                  <Table.Cell>
                    <Tooltip title={getSimulationName(simulation)}>
                      <Avatar
                        color={colorMap.getColor(simulation.SingleScenarioStudy)}
                        size="small"
                      >
                        &nbsp;
                      </Avatar>
                    </Tooltip>
                  </Table.Cell>
                }
                <Table.Cell>{simulation.SA_ID}</Table.Cell>
                <Table.Cell>{simulation.MeterRatePlan}</Table.Cell>
                <Table.Cell align="right">{formatters.commas(formatters.maxDecimals(simulation.UsageDelta, 2))}</Table.Cell>
                <Table.Cell align="right">{formatters.commas(formatters.maxDecimals(simulation.CleanNetShort2022Delta, 2))}</Table.Cell>
                <Table.Cell align="right">{formatters.dollars(simulation.BillRevenueDelta)}</Table.Cell>
                <Table.Cell align="right">{formatters.dollars(simulation.PRC_LMPDelta)}</Table.Cell>
                <Table.Cell align="right">{formatters.commas(formatters.maxDecimals(simulation.RADelta, 2))}</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </>
      }
    </PrefetchedTable>
  );

  /** ========================== Helpers =================================== */
  function getSimulationName (simulation: ScenarioReportFields) {
    const scenarioId = simulation.SingleScenarioStudy;
    return scenarioMap.hasOwnProperty(scenarioId)
      ? scenarioMap[scenarioId][0].name
      : '';
  }
};
