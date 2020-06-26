import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import moment from 'moment';

import * as api from 'navigader/api';
import {
  Card, Centered, Flex, IntervalDataGraph, IntervalDataTuple, MeterGroupChip,
  MonthSelectorExclusive, PageHeader, Progress, TimeTuple, Toggle, Typography
} from 'navigader/components';
import { IntervalDataWrapper } from 'navigader/models';
import { DERCard } from 'navigader/models/der/components';
import { ScenariosTable } from 'navigader/models/scenario/components';
import * as routes from 'navigader/routes';
import { makeStylesHook } from 'navigader/styles';
import { Frame288Numeric, MonthIndex, Scenario } from 'navigader/types';
import { makeCancelableAsync } from 'navigader/util';
import { useGetScenario, useGhgRates } from 'navigader/util/hooks';
import _ from 'navigader/util/lodash';


/** ============================ Types ===================================== */
type ScenarioProp = {
  scenario: Scenario;
};

type LoadingModalProps = {
  loading: boolean;
};

type ChartView = 'usage' | 'ghg';
type TimeDomainOption = '1d' | '2d' | '1w' | '1m';

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
  const [chartView, setChartView] = React.useState<ChartView>('usage');
  const [meterGroupData, setMeterGroupData] = React.useState<IntervalDataWrapper>();
  const [meterGroupLoading, setMeterGroupLoading] = React.useState(false);
  const [selectedMonth, setMonth] = React.useState<MonthIndex>(1);
  const [timeDomainOption, setTimeDomainOption] = React.useState<TimeDomainOption>('1m');
  const [timeDomain, setTimeDomain] = React.useState<TimeTuple>();

  const {
    loading: simulationLoading,
    scenario: scenarioWithData
  } = useGetScenario(scenario.id, { data_types: 'default' });
  
  const scenarioData = scenarioWithData?.data.default;
  const simulationData = scenarioData && IntervalDataWrapper.create(
    {...scenarioData, name: 'Simulated load' },
    'index',
    'kw'
  );

  // Load the meter group data
  React.useEffect(
    makeCancelableAsync(
      async () => {
        if (!meter_group?.id) return;
        setMeterGroupLoading(true);
        return api.getMeterGroup(meter_group.id, { data_types: 'default' });
      }, (res) => {
        setMeterGroupLoading(false);
        const loadData = res?.data.default;
        loadData && setMeterGroupData(
          IntervalDataWrapper.create({ ...loadData, name: 'Initial load' }, 'index', 'kw')
        );
      }
    ), [meter_group?.id]
  );

  const ghgRates = useGhgRates();
  const cns2022 = ghgRates && _.find(ghgRates,
      rate => rate.name === 'Clean Net Short' && rate.effective.includes('2022')
  )?.data?.rename('Clean Net Short 2022');

  return (
    <div className={classes.scenarioGraphs}>
      <Typography useDiv variant="h6">Simulation Impacts</Typography>
      <Card className={classes.loadGraphCard} raised>
        <LoadingModal loading={meterGroupLoading || simulationLoading} />
        <Centered>
          <Flex.Container alignItems="center" justifyContent="center">
            <Flex.Item>
              <MonthSelectorExclusive selected={selectedMonth} onChange={handleMonthChange} />
            </Flex.Item>
            <Flex.Item style={{ marginLeft: '1rem' }}>
              <Toggle.Group
                exclusive
                onChange={setChartView}
                size="small"
                value={chartView}
              >
                <Toggle.Button aria-label="view load curves" value="usage">Load</Toggle.Button>
                <Toggle.Button aria-label="view GHG curves" value="ghg">GHG</Toggle.Button>
              </Toggle.Group>
            </Flex.Item>

            <Flex.Item style={{ marginLeft: '1rem' }}>
              <Toggle.Group
                exclusive
                onChange={handleTimeDomainChange}
                size="small"
                value={timeDomainOption}
              >
                <Toggle.Button aria-label="one day" value="1d">1D</Toggle.Button>
                <Toggle.Button aria-label="two days" value="2d">2D</Toggle.Button>
                <Toggle.Button aria-label="one week" value="1w">1W</Toggle.Button>
                <Toggle.Button aria-label="one month" value="1m">1M</Toggle.Button>
              </Toggle.Group>
            </Flex.Item>
          </Flex.Container>
        </Centered>
        {meterGroupData && simulationData &&
          <>
            {chartView === 'usage' &&
              <IntervalDataGraph
                axisLabel="Customer load"
                month={selectedMonth}
                onTimeDomainChange={setTimeDomain}
                timeDomain={timeDomain}
                {...scaleLoadData([meterGroupData, simulationData])}
              />
            }
            {
              chartView === 'ghg' && cns2022 &&
                <>
                  <IntervalDataGraph
                    axisLabel="GHG Emissions"
                    data={[
                      meterGroupData.multiply288(cns2022, 'Initial GHG emissions'),
                      simulationData.multiply288(cns2022, 'Simulated GHG emissions')
                    ]}
                    month={selectedMonth}
                    timeDomain={timeDomain}
                    onTimeDomainChange={setTimeDomain}
                    units="tCO2"
                  />
                  <IntervalDataGraph
                    height={100}
                    hideXAxis
                    month={selectedMonth}
                    timeDomain={timeDomain}
                    onTimeDomainChange={setTimeDomain}
                    {...scaleGhgRatesData(meterGroupData, cns2022)}
                  />
                </>
            }
          </>
        }
      </Card>
    </div>
  );

  /** ============================ Callbacks =============================== */
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
  
  const { loading, scenario } = useGetScenario(id as string, {
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
            <ScenariosTable scenarios={[scenario]} />
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
 * @param {IntervalDataWrapper[]} intervals: the pre-DER and post-DER load interval data
 */
function scaleLoadData (intervals: IntervalDataTuple) {
  const [min, max] = intervals.reduce(([curMin, curMax], interval) => {
    const [minInterval, maxInterval] = interval.valueDomain();
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

/**
 * Scales the GHG rates to show in tCO2 per kW, MW or GW depending on the extent of the frame288.
 * This is very similar to `scaleLoadData`. The difference is that the GHG rates use kW/MW/GW in the
 * denominator rather than the numerator.
 *
 * @param {IntervalDataWrapper} interval: the load interval. This will be used for its domain to
 *   align the frame288
 * @param {Frame288Numeric} ghgRate: the frame288 representing the GHG rates
 */
function scaleGhgRatesData (interval: IntervalDataWrapper, ghgRate: Frame288Numeric) {
  const data = interval.align288(ghgRate);
  const max = data.valueDomain()[1];
  const magnitude = Math.abs(Math.log10(max));
  const [scale, units] = magnitude >= 6
    ? [1e6, 'GW']
    : magnitude >= 3
      ? [1e3, 'MW']
      : [1, 'kW'];
  
  return {
    data: data.multiply(scale),
    units: `tCO2/${units}`
  };
}
