import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import * as api from '@nav/shared/api';
import {
  Card, DERCard, Flex, Frame288Graph, Frame288MonthsOption, LoadTypeMenu, MeterGroupChip,
  MonthsMenu, PageHeader, PaginationState, Progress, Table, Typography
} from '@nav/shared/components';
import { BatteryConfiguration, BatteryStrategy } from '@nav/shared/models/der';
import { Frame288LoadType, Frame288Numeric, MeterGroup } from '@nav/shared/models/meter';
import { Scenario, ScenarioReport } from '@nav/shared/models/scenario';
import * as routes from '@nav/shared/routes';
import { selectModels, updateModels } from '@nav/shared/store/slices/models';
import { makeStylesHook } from '@nav/shared/styles';
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

type ScenarioProp = {
  scenario: Scenario;
};

type LoadingModalProps = {
  loading: boolean;
}

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  meterGroup: {
    marginLeft: theme.spacing(3)
  }
}), 'ScenarioResultsPage');

const useModalStyles = makeStylesHook<LoadingModalProps>(theme => ({
  modal: props => ({
    background: 'rgba(0, 0, 0, 0.3)',
    left: 0,
    height: '100%',
    opacity: props.loading ? 1 : 0,
    position: 'absolute',
    top: 0,
    transition: theme.transitions.create('opacity', {
      duration: theme.transitions.duration.standard
    }),
    width: '100%'
  })
}), 'ScenarioResultsLoadingModal');

const useScenarioGraphStyles = makeStylesHook(theme => ({
  headingSpacer: {
    height: 32
  },
  loadGraphCard: {
    // Height of the circular progress component plus 5px padding
    minHeight: 50,
    overflow: 'visible',
    position: 'relative'
  },
  loadTypeMenu: {
    marginTop: theme.spacing(1)
  },
  scenarioGraphs: {
    marginTop: theme.spacing(3)
  }
}), 'ScenarioGraph');

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
                <Table.Cell>{simulation.report?.SA_ID}</Table.Cell>
                <Table.Cell>{simulation.report?.MeterRatePlan}</Table.Cell>
                <Table.Cell align="right">{formatters.maxDecimals(simulation.report?.UsageDelta, 2)}</Table.Cell>
                <Table.Cell align="right">{formatters.maxDecimals(simulation.report?.BillDelta, 2)}</Table.Cell>
                <Table.Cell align="right">{formatters.maxDecimals(simulation.report?.CleanNetShort2022Delta, 2)}</Table.Cell>
                <Table.Cell align="right">N/A</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </>
      }
    </Table>
  );
};

const ScenarioContext: React.FC<ScenarioProp> = ({ scenario }) => {
  const history = useHistory();
  const classes = useStyles();
  
  return (
    <Flex.Container alignItems="center">
      <Flex.Item>
        {scenario &&
          <DERCard
            configuration={scenario.der?.der_configuration}
            strategy={scenario.der?.der_strategy}
          />
        }
      </Flex.Item>
      <Flex.Item className={classes.meterGroup}>
        <MeterGroupChip
          meterGroup={scenario?.meter_group}
          onClick={goToMeterGroup}
          showCount
        />
      </Flex.Item>
    </Flex.Container>
  );
  
  /** ============================ Callbacks =============================== */
  function goToMeterGroup () {
    if (!scenario || !scenario.meter_group) return;
    history.push(routes.meterGroup(scenario.meter_group.id));
  }
};

const LoadingModal: React.FC<LoadingModalProps> = (props) => {
  const classes = useModalStyles(props);
  return (
    <Flex.Container alignItems="center" className={classes.modal} justifyContent="center">
      <Progress circular />
    </Flex.Container>
  );
};

const ScenarioGraphs: React.FC<ScenarioProp> = ({ scenario }) => {
  const { meter_group } = scenario;
  const classes = useScenarioGraphStyles();

  // State
  const [loadType, setLoadType] = React.useState<Frame288LoadType>('average');
  const [meterGroupData, setMeterGroupData] = React.useState<Frame288Numeric>();
  const [meterGroupLoading, setMeterGroupLoading] = React.useState(false);
  const [simulationData, setSimulationData] = React.useState<Frame288Numeric>();
  const [simulationLoading, setSimulationLoading] = React.useState(false);
  const [selectedMonths, setMonths] = React.useState<Frame288MonthsOption>('all');

  // Load the meter group data
  React.useEffect(
    makeCancelableAsync(
      async () => {
        if (!meter_group?.id) return;
        setMeterGroupLoading(true);
        return api.getMeterGroup(meter_group.id, { data_types: loadType });
      }, (res) => {
        const loadData = res?.data[loadType];
        loadData && setMeterGroupData(new Frame288Numeric(loadData));
        setMeterGroupLoading(false);
      }
    ), [meter_group?.id, loadType]
  );
  
  // Load the simulation data
  React.useEffect(
    makeCancelableAsync(
      async () => {
        setSimulationLoading(true);
        return api.getScenario(scenario.id, { data_types: loadType });
      },
      res => {
        const loadData = res?.data[loadType];
        loadData && setSimulationData(new Frame288Numeric(loadData));
        setSimulationLoading(false);
      }
    ), [scenario.id, loadType]
  );
  
  const graphWidth = 43;
  const combinedLoadRange = getLoadRange();

  return (
    <Flex.Container className={classes.scenarioGraphs} justifyContent="space-between">
      <Flex.Item basis={10}>
        <div className={classes.headingSpacer} />
        <MonthsMenu selectedMonths={selectedMonths} changeMonths={setMonths} />
        <LoadTypeMenu
          changeType={setLoadType}
          className={classes.loadTypeMenu}
          selectedType={loadType}
        />
      </Flex.Item>
      <Flex.Item basis={graphWidth}>
        <Typography useDiv variant="h6">Initial Load</Typography>
        <Card className={classes.loadGraphCard} raised>
          {meterGroupData &&
            <Frame288Graph
              data={meterGroupData}
              loadRange={combinedLoadRange}
              loadType={loadType}
              months={selectedMonths}
            />
          }
          <LoadingModal loading={meterGroupLoading} />
        </Card>
      </Flex.Item>
      <Flex.Item basis={graphWidth}>
        <Typography useDiv variant="h6">Simulated Load</Typography>
        <Card className={classes.loadGraphCard} raised>
          {simulationData &&
            <Frame288Graph
              data={simulationData}
              loadRange={combinedLoadRange}
              loadType={loadType}
              months={selectedMonths}
            />
          }
          <LoadingModal loading={simulationLoading} />
        </Card>
      </Flex.Item>
    </Flex.Container>
  );
  
  /** ============================ Helpers ================================= */
  /**
   * Returns the minimum and maximum load values from both the meter group (initial) data and the
   * simulation data. If one of the two is missing, returns the two values for the dataset that's
   * present. If both are missing, returns `undefined`.
   */
  function getLoadRange (): [number, number] | undefined {
    if (!meterGroupData && !simulationData) return undefined;
    
    const meterGroupRange = meterGroupData ? meterGroupData.getRange() : [Infinity, -Infinity];
    const simulationRange = simulationData ? simulationData.getRange() : [Infinity, -Infinity];
    
    return [
      Math.min(meterGroupRange[0], simulationRange[0]),
      Math.max(meterGroupRange[1], simulationRange[1]),
    ]
  }
};

export const ScenarioResultsPage: React.FC = () => {
  const [scenario, setScenario] = React.useState<Scenario>();
  const { id } = useParams();
  
  // Loads the scenario
  React.useEffect(
    makeCancelableAsync(async () => {
      if (!id) return;
      return api.getScenario(id, { include: ['ders', 'meter_groups', 'report'] });
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
      
      {scenario && <ScenarioContext scenario={scenario} />}
      {scenario && <ScenarioGraphs scenario={scenario} />}
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
