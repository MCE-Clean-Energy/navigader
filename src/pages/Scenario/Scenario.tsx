import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import * as api from '@nav/shared/api';
import { PageHeader, PaginationState, Table } from '@nav/shared/components';
import { BatteryConfiguration, BatteryStrategy } from '@nav/shared/models/der';
import { MeterGroup } from '@nav/shared/models/meter';
import { Scenario, ScenarioReport } from '@nav/shared/models/scenario';
import * as routes from '@nav/shared/routes';
import { selectModels, updateModels } from '@nav/shared/store/slices/models';
import { formatters, makeCancelableAsync } from '@nav/shared/util';


/** ============================ Types ===================================== */
type SimulationsTableProps = {
  filterParams: {
    derConfiguration: BatteryConfiguration['id'];
    derStrategy: BatteryStrategy['id'];
    meterGroup: MeterGroup['id'];
  };
  report: ScenarioReport;
};

/** ============================ Components ================================ */
const SimulationsTable: React.FC<SimulationsTableProps> = ({ filterParams, report }) => {
  const dispatch = useDispatch();
  
  // Loads the scenario's meters
  const getMeters = React.useCallback(
    async (state: PaginationState) => {
      const response = await api.getDerSimulations({
          ...filterParams,
        page: state.currentPage + 1,
        page_size: state.rowsPerPage
      });
      
      // Mix in the report data
      response.data.forEach((datum) => {
        datum.report = report.rows[datum.meter];
      });
      
      dispatch(updateModels(response.data));
      return response;
    },
    [filterParams, report, dispatch]
  );
  
  return (
    <Table
      aria-label="simulations table"
      dataFn={getMeters}
      dataSelector={selectModels('derSimulations')}
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
              <Table.Cell align="right">Usage Delta (kWh)</Table.Cell>
              <Table.Cell align="right">Bill Delta ($)</Table.Cell>
              <Table.Cell align="right">CNS 2022 Delta (tCO<sub>2</sub>)</Table.Cell>
              <Table.Cell align="right">RA System Peak Delta</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {simulations.map(simulation =>
              <Table.Row key={simulation.id}>
                <Table.Cell useTh>{simulation.report?.SA_ID}</Table.Cell>
                <Table.Cell useTh>{simulation.report?.MeterRatePlan}</Table.Cell>
                <Table.Cell align="right" useTh>{formatters.maxDecimals(simulation.report?.UsageDelta, 2)}</Table.Cell>
                <Table.Cell align="right" useTh>{formatters.maxDecimals(simulation.report?.BillDelta, 2)}</Table.Cell>
                <Table.Cell align="right" useTh>{formatters.maxDecimals(simulation.report?.CleanNetShort2022Delta, 2)}</Table.Cell>
                <Table.Cell align="right" useTh>N/A</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </>
      }
    </Table>
  );
};

export const ScenarioPage: React.FC = () => {
  const [scenario, setScenario] = React.useState<Scenario | null>(null);
  const { id } = useParams();
  
  // Loads the scenario
  React.useEffect(
    makeCancelableAsync(async () => {
      if (!id) return null;
      return api.getScenario(id, { include: ['meter_groups', 'report'] });
    }, res => setScenario(res)),
    [id]
  );

  return (
    <>
      <PageHeader
        breadcrumbs={[
          ['Dashboard', routes.dashboard.base],
          'View Scenario'
        ]}
        title={scenario ? scenario.name : 'Scenario Loading...'}
      />
      {scenario && scenario.meter_group && scenario.report &&
        <SimulationsTable
          filterParams={{
            derConfiguration: scenario.metadata.der_configuration,
            derStrategy: scenario.metadata.der_strategy,
            meterGroup: scenario.meter_group.id
          }}
          report={scenario.report}
        />
      }
    </>
  );
};
