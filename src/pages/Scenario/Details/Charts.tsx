import * as React from 'react';

import { IntervalDataGraph } from 'navigader/components';
import { CostFunction, DateTuple, IntervalData, MonthIndex } from 'navigader/types';
import { hooks } from 'navigader/util';
import { LoadingModal } from './LoadingModal';

/** ============================ Types ====================================== */
type ChartProps = {
  cost_function: Pick<CostFunction, 'id' | 'name'>;
  meterGroupData: IntervalData;
  scenarioData: IntervalData;
  selectedMonth: MonthIndex;
  timeDomain?: DateTuple;
  updateTimeDomain: (domain: DateTuple) => void;
};

/** ============================ Components ================================ */
export const GHGCharts: React.FC<ChartProps> = (props) => {
  const {
    cost_function,
    meterGroupData,
    scenarioData,
    selectedMonth,
    timeDomain,
    updateTimeDomain,
  } = props;

  const rateData = hooks.useGhgRate(cost_function.id)?.data;
  return (
    <>
      <LoadingModal loading={!rateData} />
      {rateData && (
        <>
          <IntervalDataGraph
            axisLabel="GHG Emissions"
            data={[
              meterGroupData.multiply288(rateData).rename('Initial GHG emissions'),
              scenarioData.multiply288(rateData).rename('Simulated GHG emissions'),
            ]}
            month={selectedMonth}
            timeDomain={timeDomain}
            onTimeDomainChange={updateTimeDomain}
            units="tCO2"
          />
          <IntervalDataGraph
            height={100}
            hideXAxis
            month={selectedMonth}
            timeDomain={timeDomain}
            onTimeDomainChange={updateTimeDomain}
            {...scaleInvertedData(meterGroupData.align288(rateData), 'tCO2')}
          />
        </>
      )}
    </>
  );
};

export const ProcurementCharts: React.FC<ChartProps> = (props) => {
  const {
    cost_function,
    meterGroupData,
    scenarioData,
    selectedMonth,
    timeDomain,
    updateTimeDomain,
  } = props;
  const caisoRate = hooks.useCAISORate(cost_function?.id, {
    data_types: 'default',
    period: 60,
  });

  const initialProcurement = React.useMemo(
    () =>
      caisoRate &&
      meterGroupData.multiply(caisoRate.data.default!).rename('Initial procurement cost'),
    [meterGroupData, caisoRate]
  );

  const simulatedProcurement = React.useMemo(
    () =>
      caisoRate &&
      scenarioData.multiply(caisoRate.data.default!).rename('Simulated procurement cost'),
    [scenarioData, caisoRate]
  );

  return (
    <>
      <LoadingModal loading={!(caisoRate && initialProcurement && simulatedProcurement)} />
      {caisoRate && initialProcurement && simulatedProcurement && (
        <>
          <IntervalDataGraph
            axisLabel="Procurement Costs"
            data={[initialProcurement, simulatedProcurement]}
            month={selectedMonth}
            timeDomain={timeDomain}
            onTimeDomainChange={updateTimeDomain}
            units="$"
          />
          <IntervalDataGraph
            height={100}
            hideXAxis
            month={selectedMonth}
            onTimeDomainChange={updateTimeDomain}
            precision={5}
            timeDomain={timeDomain}
            {...scaleInvertedData(caisoRate.data.default!, '$')}
          />
        </>
      )}
    </>
  );
};

/** ============================ Helpers =================================== */
/**
 * Scales the data to show in kW, MW or GW depending on the extent of the interval's values
 *
 * @param {IntervalData} interval: the load interval being scaled
 * @param {string} units: the units of the data being scaled
 */
function scaleInvertedData(interval: IntervalData, units: string) {
  const max = interval.valueDomain[1];
  const magnitude = Math.abs(Math.log10(max));
  const [scale, wattage] = magnitude >= 6 ? [1e6, 'GW'] : magnitude >= 3 ? [1e3, 'MW'] : [1, 'kW'];
  return {
    data: interval.multiply(scale),
    units: `${units}/${wattage}`,
  };
}
