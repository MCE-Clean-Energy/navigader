import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import * as api from '@nav/common/api';
import {
  Card, Flex, Frame288Graph, Frame288MonthsOption, LoadTypeMenu, MeterGroupChip, MonthsMenu,
  PageHeader, Progress, Typography
} from '@nav/common/components';
import { Components } from '@nav/common/models/der';
import { Frame288LoadType, Frame288Numeric } from '@nav/common/models/meter';
import { Scenario } from '@nav/common/models/scenario';
import * as routes from '@nav/common/routes';
import { makeStylesHook } from '@nav/common/styles';
import { makeCancelableAsync } from '@nav/common/util';
import { ScenariosTable } from '@nav/common/models/scenario/components';


/** ============================ Types ===================================== */
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
const ScenarioContext: React.FC<ScenarioProp> = ({ scenario }) => {
  const history = useHistory();
  const classes = useStyles();
  
  return (
    <Flex.Container alignItems="center">
      <Flex.Item>
        {scenario &&
          <Components.DERCard
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
      <Flex.Item basis={graphWidth}>
        <Typography useDiv variant="h6">Initial Aggregate Load Curve by Month</Typography>
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

      <Flex.Item>
        <div className={classes.headingSpacer} />
        <MonthsMenu selectedMonths={selectedMonths} changeMonths={setMonths} />
        <LoadTypeMenu
          changeType={setLoadType}
          className={classes.loadTypeMenu}
          selectedType={loadType}
        />
      </Flex.Item>

      <Flex.Item basis={graphWidth}>
        <Typography useDiv variant="h6">Simulated Aggregate Load Curve by Month</Typography>
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
      return api.getScenario(id, { include: ['ders', 'meter_groups', 'report', 'report_summary'] });
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
      {scenario && <ScenariosTable scenarios={[scenario]} />}
    </>
  );
};
