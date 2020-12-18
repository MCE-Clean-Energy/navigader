import _ from 'lodash';
import * as React from 'react';

import * as api from 'navigader/api';
import { ColorMap } from 'navigader/styles';
import { Scenario, ScenarioReportFields } from 'navigader/types';
import { formatters } from 'navigader/util';
import { Avatar } from '../Avatar';
import { FileDownload } from '../File';
import { PrefetchedTable, Table } from '../Table';
import { Tooltip } from '../Tooltip';
import { ImpactColumnHeader } from './ImpactColumnHeader';

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
      data={simulations.map((s) => ({ ...s, id: s.ID + s.ScenarioID }))}
      headerActions={
        <FileDownload downloadFn={(cb) => api.downloadCustomerData(_.map(scenarios, 'id'), cb)} />
      }
      initialSorting={{
        dir: 'desc',
        key: 'UsageDelta',
      }}
      raised
      title="Customers"
    >
      {(simulations) => (
        <>
          <Table.Head>
            <Table.Row>
              {colorMap && <Table.Cell />}
              <Table.Cell sortBy="SA_ID">SA ID</Table.Cell>
              <Table.Cell>Rate Plan</Table.Cell>
              <ImpactColumnHeader
                column="Usage Impact"
                info={{
                  measuresImpact: 'in customer electricity usage',
                  negativeMeans: 'electricity consumption from the grid has gone down',
                  positiveMeans: 'electricity consumption from the grid has gone up',
                }}
                sortBy="UsageDelta"
                sortDir="desc"
                units="kWh"
              />
              <ImpactColumnHeader
                column="GHG Impact"
                info={{
                  measuresImpact: 'in GHG emissions',
                  negativeMeans: 'GHG emissions have gone down',
                  positiveMeans: 'GHG emissions have gone up',
                }}
                sortBy="GHGDelta"
                units={
                  <>
                    tCO<sub>2</sub>
                  </>
                }
              />
              <ImpactColumnHeader
                column="RA Impact"
                info={{
                  measuresImpact: 'to resource adequacy requirements',
                  negativeMeans: 'resource adequacy requirements have gone down',
                  positiveMeans: 'resource adequacy requirements have gone up',
                }}
                sortBy="RADelta"
                units="kW"
              />
              <ImpactColumnHeader
                column="Procurement Cost"
                info={{
                  measuresImpact: 'to expenses incurred procuring electricity',
                  negativeMeans: 'CCA procurement expenses have gone down',
                  positiveMeans: 'CCA procurement expenses have gone up',
                }}
                sortBy="ProcurementDelta"
                units="$"
              />
              <ImpactColumnHeader
                column="Revenue Impact"
                info={{
                  measuresImpact: "to CCA's electricity sales",
                  negativeMeans: 'revenues from electricity sales have gone down',
                  positiveMeans: 'revenues from electricity sales have gone up',
                }}
                sortBy="BillRevenueDelta"
                units="$"
              />
              <ImpactColumnHeader
                column="Expenses Impact"
                info={{
                  measuresImpact:
                    'to overall expenses. Calculated as procurement expenses plus $6/kW for RA ' +
                    'impacts',
                  negativeMeans: 'overall expenses have gone down',
                  positiveMeans: 'overall expenses have gone up',
                }}
                sortBy="ExpenseDelta"
                units="$"
              />
              <ImpactColumnHeader
                column="Profits Impact"
                info={{
                  measuresImpact: 'to overall profits. Calculated as revenues minus expenses',
                  negativeMeans: 'overall profits have gone down',
                  positiveMeans: 'overall profits have gone up',
                }}
                sortBy="ProfitDelta"
                units="$"
              />
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {simulations.map((simulation) => (
              <Table.Row
                key={simulation.id}
                onMouseEnter={() => updateHover([simulation.ScenarioID, simulation.ID].join('__'))}
                onMouseLeave={() => updateHover()}
              >
                {colorMap && (
                  <Table.Cell>
                    <Tooltip title={getSimulationName(simulation)}>
                      <Avatar color={colorMap.getColor(simulation.ScenarioID)} size="small">
                        &nbsp;
                      </Avatar>
                    </Tooltip>
                  </Table.Cell>
                )}
                <Table.Cell>{simulation.SA_ID}</Table.Cell>
                <Table.Cell>{simulation.MeterRatePlan}</Table.Cell>
                <Table.Cell align="right">
                  {formatters.commas(formatters.maxDecimals(simulation.UsageDelta, 2)) ?? '-'}
                </Table.Cell>
                <Table.Cell align="right">
                  {formatters.commas(formatters.maxDecimals(simulation.GHGDelta, 2)) ?? '-'}
                </Table.Cell>
                <Table.Cell align="right">
                  {formatters.commas(formatters.maxDecimals(simulation.RADelta, 2)) ?? '-'}
                </Table.Cell>
                <Table.Cell align="right">
                  {formatters.dollars(simulation.ProcurementCostDelta) ?? '-'}
                </Table.Cell>
                <Table.Cell align="right">
                  {formatters.dollars(simulation.BillRevenueDelta) ?? '-'}
                </Table.Cell>
                <Table.Cell align="right">
                  {formatters.dollars(simulation.ExpenseDelta) ?? '-'}
                </Table.Cell>
                <Table.Cell align="right">
                  {formatters.dollars(simulation.ProfitDelta) ?? '-'}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </>
      )}
    </PrefetchedTable>
  );

  /** ========================== Helpers =================================== */
  function getSimulationName(simulation: ScenarioReportFields) {
    const scenarioId = simulation.ScenarioID;
    return scenarioMap.hasOwnProperty(scenarioId) ? scenarioMap[scenarioId][0].name : '';
  }
};
