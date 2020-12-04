import _ from 'lodash';
import * as React from 'react';

import { IntervalDataGraph } from 'navigader/components';
import { DateTuple, IntervalData, MonthIndex } from 'navigader/types';
import { useCAISORates, useGhgRates } from 'navigader/util/hooks';
import { LoadingModal } from './LoadingModal';

/** ============================ Types ====================================== */
type ChartProps = {
  meterGroupData: IntervalData;
  scenarioData: IntervalData;
  selectedMonth: MonthIndex;
  timeDomain?: DateTuple;
  updateTimeDomain: (domain: DateTuple) => void;
};

/** ============================ Components ================================ */
export const GHGCharts: React.FC<ChartProps> = (props) => {
  const { meterGroupData, scenarioData, selectedMonth, timeDomain, updateTimeDomain } = props;
  const ghgRates = useGhgRates();
  const cns2022 =
    ghgRates &&
    _.find(
      ghgRates,
      (rate) => rate.name === 'Clean Net Short' && rate.effective.includes('2022')
    )?.data?.rename('Clean Net Short 2022');

  return (
    <>
      <LoadingModal loading={!cns2022} />
      {cns2022 && (
        <>
          <IntervalDataGraph
            axisLabel="GHG Emissions"
            data={[
              meterGroupData.multiply288(cns2022).rename('Initial GHG emissions'),
              scenarioData.multiply288(cns2022).rename('Simulated GHG emissions'),
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
            {...scaleInvertedData(meterGroupData.align288(cns2022), 'tCO2')}
          />
        </>
      )}
    </>
  );
};

export const ProcurementCharts: React.FC<ChartProps> = (props) => {
  const { meterGroupData, scenarioData, selectedMonth, timeDomain, updateTimeDomain } = props;
  const year = scenarioData?.years[0];
  const caisoRate = useCAISORates({
    year,
    data_types: 'default',
    period: 60,
  })[0];

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
