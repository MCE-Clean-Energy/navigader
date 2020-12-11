import * as React from 'react';
import { DateTime, Duration } from 'luxon';

import {
  Alert,
  Card,
  IntervalDataGraph,
  IntervalDataTuple,
  ScenariosTable,
  Typography,
} from 'navigader/components';
import { makeStylesHook } from 'navigader/styles';
import { DateTuple, MonthIndex, Scenario } from 'navigader/types';
import { hooks } from 'navigader/util';
import { ChartControls, ChartView, TimeDomainOption } from './ChartControls';
import { GHGCharts, ProcurementCharts } from './Charts';
import { LoadingModal } from './LoadingModal';

/** ============================ Types ===================================== */
type ScenarioProp = {
  scenario: Scenario;
};

/** ============================ Styles ==================================== */
const useNoDataAlertStyles = makeStylesHook(
  (theme) => ({
    alert: { marginTop: theme.spacing(1.5) },
  }),
  'NoDataAlert'
);

const useIntervalChartStyles = makeStylesHook(
  (theme) => ({
    headingSpacer: {
      height: 32,
    },
    loadGraphCard: {
      // Height of the circular progress component plus 5px padding
      minHeight: 50,
      overflow: 'visible',
      position: 'relative',
    },
    loadTypeMenu: {
      marginTop: theme.spacing(1),
    },
  }),
  'IntervalChart'
);

const useStyles = makeStylesHook(
  (theme) => ({
    table: {
      marginTop: theme.spacing(2),
    },
  }),
  'AggregateImpactsTab'
);

/** ============================ Components ================================ */
const NoDataAlert: React.FC<{ cost_fn_type: string }> = ({ cost_fn_type }) => {
  const classes = useNoDataAlertStyles();
  return (
    <Alert className={classes.alert} type="warning">
      No {cost_fn_type} was selected for this scenario.
    </Alert>
  );
};
const IntervalChart: React.FC<ScenarioProp> = ({ scenario }) => {
  const { meter_group } = scenario;
  const classes = useIntervalChartStyles();

  // State
  const [chartView, setChartView] = React.useState<ChartView>('usage');
  const [selectedMonth, setMonth] = React.useState<MonthIndex>(1);
  const [timeDomainOption, setTimeDomainOption] = React.useState<TimeDomainOption>('1m');
  const [timeDomain, setTimeDomain] = React.useState<DateTuple>();

  const simulationData = scenario.data.default;
  const { loading, meterGroup } = hooks.useMeterGroup(meter_group!.id, {
    data_types: 'default',
    period: 60,
  });

  const meterGroupData = meterGroup?.data.default;
  return (
    <div>
      <Typography useDiv variant="h6">
        Simulation Results
      </Typography>
      <Card className={classes.loadGraphCard} raised>
        <LoadingModal loading={loading} />
        <ChartControls
          chartView={chartView}
          selectedMonth={selectedMonth}
          timeDomainOption={timeDomainOption}
          updateChartView={setChartView}
          updateMonth={handleMonthChange}
          updateTimeDomain={handleTimeDomainChange}
        />
        {meterGroupData && simulationData && (
          <>
            {chartView === 'usage' && (
              <IntervalDataGraph
                axisLabel="Customer load"
                month={selectedMonth}
                onTimeDomainChange={setTimeDomain}
                timeDomain={timeDomain}
                {...scaleLoadData([
                  meterGroupData.rename('Initial load'),
                  simulationData.rename('Simulated load'),
                ])}
              />
            )}
            {chartView === 'ghg' ? (
              scenario.cost_functions.ghg_rate ? (
                <GHGCharts
                  cost_function={scenario.cost_functions.ghg_rate}
                  meterGroupData={meterGroupData}
                  scenarioData={simulationData}
                  selectedMonth={selectedMonth}
                  timeDomain={timeDomain}
                  updateTimeDomain={setTimeDomain}
                />
              ) : (
                <NoDataAlert cost_fn_type="GHG rate" />
              )
            ) : null}
            {chartView === 'procurement' ? (
              scenario.cost_functions.procurement_rate ? (
                <ProcurementCharts
                  cost_function={scenario.cost_functions.procurement_rate}
                  meterGroupData={meterGroupData}
                  scenarioData={simulationData}
                  selectedMonth={selectedMonth}
                  timeDomain={timeDomain}
                  updateTimeDomain={setTimeDomain}
                />
              ) : (
                <NoDataAlert cost_fn_type="procurement rate" />
              )
            ) : null}
          </>
        )}
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
  function handleMonthChange(month: MonthIndex) {
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
  function handleTimeDomainChange(
    timeDomainOption: TimeDomainOption,
    month: MonthIndex = selectedMonth
  ) {
    setTimeDomainOption(timeDomainOption);
    const monthStart = meterGroupData?.startOfMonth(month);
    if (!monthStart) return;

    const duration = (() => {
      switch (timeDomainOption) {
        case '1d':
          return Duration.fromObject({ days: 1 });
        case '2d':
          return Duration.fromObject({ days: 2 });
        case '1w':
          return Duration.fromObject({ week: 1 });
        case '1m':
          return Duration.fromObject({ month: 1 });
      }
    })();

    // Update the state variable
    setTimeDomain([monthStart, DateTime.fromJSDate(monthStart).plus(duration).toJSDate()]);
  }
};

export const AggregateImpactsTab: React.FC<ScenarioProp> = ({ scenario }) => {
  const classes = useStyles();
  return (
    <>
      <IntervalChart scenario={scenario} />
      <div className={classes.table}>
        <ScenariosTable
          scenarios={[scenario]}
          title="DER Program Scenario Impacts: Delta between Initial Load and Simulated Load"
        />
      </div>
    </>
  );
};

/** ============================ Helpers =================================== */
/**
 * Scales the data to show in kW, MW or GW depending on the extent of the interval's power values
 *
 * @param {IntervalDataTuple} intervals: the pre-DER and post-DER load interval data
 */
function scaleLoadData(intervals: IntervalDataTuple) {
  const [min, max] = intervals.reduce(
    ([curMin, curMax], interval) => {
      const [minInterval, maxInterval] = interval.valueDomain;
      return [Math.min(curMin, minInterval), Math.max(curMax, maxInterval)];
    },
    [Infinity, -Infinity]
  );

  const magnitude = Math.log10(Math.max(Math.abs(min), Math.abs(max)));
  const [divisor, units] = magnitude >= 6 ? [1e6, 'GW'] : magnitude >= 3 ? [1e3, 'MW'] : [1, 'kW'];

  return {
    data: intervals.map((interval) => interval.divide(divisor)) as IntervalDataTuple,
    units,
  };
}
