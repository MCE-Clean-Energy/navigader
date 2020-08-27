import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import moment from 'moment';

import * as api from 'navigader/api';
import {
  Card, Flex, IntervalDataGraph, IntervalDataTuple, MeterGroupChip, PageHeader, Progress, Typography
} from 'navigader/components';
import { DERCard } from 'navigader/models/der/components';
import { ScenariosTable } from 'navigader/models/scenario/components';
import * as routes from 'navigader/routes';
import { makeStylesHook } from 'navigader/styles';
import { DateTuple, IntervalData, MonthIndex, Scenario } from 'navigader/types';
import { makeCancelableAsync } from 'navigader/util';
import { useScenario } from 'navigader/util/hooks';
import { ChartControls, ChartView, TimeDomainOption } from './ChartControls';
import { GHGCharts, ProcurementCharts } from './Charts';
import { LoadingModal } from './LoadingModal';


/** ============================ Types ===================================== */
type ScenarioProp = {
  scenario: Scenario;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  table: {
    marginTop: theme.spacing(2)
  }
}), 'ScenarioResultsPage');

const useScenarioContextStyles = makeStylesHook(theme => ({
  meterGroup: {
    marginLeft: theme.spacing(3)
  }
}), 'ScenarioContext');

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
  const classes = useScenarioContextStyles();

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

  /** ========================== Callbacks ================================= */
  function goToMeterGroup () {
    if (!scenario || !scenario.meter_group) return;
    history.push(routes.meterGroup(scenario.meter_group.id));
  }
};

const ScenarioGraphs: React.FC<ScenarioProp> = ({ scenario }) => {
  const { meter_group } = scenario;
  const classes = useScenarioGraphStyles();

  // State
  const [chartView, setChartView] = React.useState<ChartView>('usage');
  const [meterGroupData, setMeterGroupData] = React.useState<IntervalData>();
  const [meterGroupLoading, setMeterGroupLoading] = React.useState(false);
  const [selectedMonth, setMonth] = React.useState<MonthIndex>(1);
  const [timeDomainOption, setTimeDomainOption] = React.useState<TimeDomainOption>('1m');
  const [timeDomain, setTimeDomain] = React.useState<DateTuple>();

  const {
    loading: simulationLoading,
    scenario: scenarioWithData
  } = useScenario(scenario.id, { data_types: 'default', period: 60 });

  const simulationData = scenarioWithData?.data.default;

  // Load the meter group data
  React.useEffect(
    makeCancelableAsync(
      async () => {
        if (!meter_group?.id) return;
        setMeterGroupLoading(true);
        return api.getMeterGroup(meter_group.id, { data_types: 'default', period: 60 });
      }, (res) => {
        setMeterGroupLoading(false);
        setMeterGroupData(res?.data.default);
      }
    ), [meter_group?.id]
  );

  return (
    <div className={classes.scenarioGraphs}>
      <Typography useDiv variant="h6">Simulation Impacts</Typography>
      <Card className={classes.loadGraphCard} raised>
        <LoadingModal loading={meterGroupLoading || simulationLoading} />
        <ChartControls
          chartView={chartView}
          selectedMonth={selectedMonth}
          timeDomainOption={timeDomainOption}
          updateChartView={setChartView}
          updateMonth={handleMonthChange}
          updateTimeDomain={handleTimeDomainChange}
        />
        {meterGroupData && simulationData &&
          <>
            {chartView === 'usage' &&
              <IntervalDataGraph
                axisLabel="Customer load"
                month={selectedMonth}
                onTimeDomainChange={setTimeDomain}
                timeDomain={timeDomain}
                {
                  ...scaleLoadData([
                    meterGroupData.rename('Initial load'),
                    simulationData?.rename('Simulated load')
                  ])
                }
              />
            }
            {chartView === 'ghg' &&
              <GHGCharts
                meterGroupData={meterGroupData}
                scenarioData={simulationData}
                selectedMonth={selectedMonth}
                timeDomain={timeDomain}
                updateTimeDomain={setTimeDomain}
              />
            }
            {chartView === 'procurement' &&
              <ProcurementCharts
                meterGroupData={meterGroupData}
                scenarioData={simulationData}
                selectedMonth={selectedMonth}
                timeDomain={timeDomain}
                updateTimeDomain={setTimeDomain}
              />
            }
          </>
        }
      </Card>
    </div>
  );

  /** ========================== Callbacks ================================= */
  /**
   * Called when the month selector changes. This changes the selected month and resets the time
   * domain to a month
   *
   * @param {MonthIndex} month: the month now being shown
   */
  function handleMonthChange (month: MonthIndex) {
    setMonth(month);
    handleTimeDomainChange('1m', month);
  }

  /**
   * Called when the time domain selector changes. This changes the active time domain by setting
   * the domain start to the start of the given month, and the domain end to the appropriate
   * distance ahead of the start
   *
   * @param {TimeDomainOption} timeDomainOption: the timespan to set the domain to
   * @param {MonthIndex} month: the month to start at
   */
  function handleTimeDomainChange (
    timeDomainOption: TimeDomainOption,
    month: MonthIndex = selectedMonth
  ) {
    setTimeDomainOption(timeDomainOption);
    const monthStart = meterGroupData?.startOfMonth(month);
    if (!monthStart) return;

    const domainEnd = moment(monthStart);
    switch (timeDomainOption) {
      case '1d':
        domainEnd.add(1, 'day');
        break;
      case '2d':
        domainEnd.add(2, 'days');
        break;
      case '1w':
        domainEnd.add(1, 'week');
        break;
      case '1m':
        domainEnd.endOf('month');
        break;
    }

    // Update the state variable
    setTimeDomain([monthStart, domainEnd.toDate()]);
  }
};

export const ScenarioResultsPage: React.FC = () => {
  const { id } = useParams();
  const classes = useStyles();

  const { loading, scenario } = useScenario(id as string, {
    include: ['ders', 'meter_groups', 'report', 'report_summary']
  });

  return (
    <>
      <PageHeader
        breadcrumbs={[
          ['Dashboard', routes.dashboard.base],
          'Scenario Details'
        ]}
        title="Scenario Details"
      />

      {loading && <Progress circular />}
      {scenario && (
        <>
          <ScenarioContext scenario={scenario} />
          <ScenarioGraphs scenario={scenario} />
          <div className={classes.table}>
            <ScenariosTable
              scenarios={[scenario]}
              title="DER Program Scenario Impacts: Delta between Initial Load and Simulated Load"
            />
          </div>
        </>
      )}
    </>
  );
};

/** ============================ Helpers =================================== */
/**
 * Scales the data to show in kW, MW or GW depending on the extent of the interval's power values
 *
 * @param {IntervalData[]} intervals: the pre-DER and post-DER load interval data
 */
function scaleLoadData (intervals: IntervalDataTuple) {
  const [min, max] = intervals.reduce(([curMin, curMax], interval) => {
    const [minInterval, maxInterval] = interval.valueDomain;
    return [Math.min(curMin, minInterval), Math.max(curMax, maxInterval)];
  }, [Infinity, -Infinity]);

  const magnitude = Math.log10(Math.max(Math.abs(min), Math.abs(max)));
  const [divisor, units] = magnitude >= 6
    ? [1e6, 'GW']
    : magnitude >= 3
      ? [1e3, 'MW']
      : [1, 'kW'];

  return {
    data: intervals.map(interval => interval.divide(divisor)) as IntervalDataTuple,
    units
  };
}
