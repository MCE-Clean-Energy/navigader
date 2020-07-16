import * as React from 'react';

import { Centered, Flex, MonthSelectorExclusive, Toggle } from 'navigader/components';
import { MonthIndex } from 'navigader/types';


/** ============================ Types ===================================== */
export type ChartView = 'usage' | 'ghg' | 'procurement';
export type TimeDomainOption = '1d' | '2d' | '1w' | '1m';

type ChartTypeSelectorProps = {
  chartView: ChartView;
  updateChartView: (view: ChartView) => void;
};

type TimeDomainSelectorProps = {
  timeDomainOption: TimeDomainOption;
  updateTimeDomain: (domain: TimeDomainOption) => void;
};

type ChartControlsProps = ChartTypeSelectorProps & TimeDomainSelectorProps & {
  selectedMonth: MonthIndex;
  updateMonth: (month: MonthIndex) => void;
};

/** ============================ Components ================================ */
const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({ chartView, updateChartView }) =>
  <Toggle.Group exclusive onChange={updateChartView} size="small" value={chartView}>
    <Toggle.Button aria-label="view load curves" value="usage">Load</Toggle.Button>
    <Toggle.Button aria-label="view GHG curves" value="ghg">GHG</Toggle.Button>
    <Toggle.Button aria-label="view procurement curves" value="procurement">
      Procurement
    </Toggle.Button>
  </Toggle.Group>;
  
const TimeDomainSelector: React.FC<TimeDomainSelectorProps> =
  ({ timeDomainOption, updateTimeDomain }) =>
    <Toggle.Group
      exclusive
      onChange={updateTimeDomain}
      size="small"
      value={timeDomainOption}
    >
      <Toggle.Button aria-label="one day" value="1d">1D</Toggle.Button>
      <Toggle.Button aria-label="two days" value="2d">2D</Toggle.Button>
      <Toggle.Button aria-label="one week" value="1w">1W</Toggle.Button>
      <Toggle.Button aria-label="one month" value="1m">1M</Toggle.Button>
    </Toggle.Group>;
  
export const ChartControls: React.FC<ChartControlsProps> = (props) => {
  const {
    chartView,
    selectedMonth,
    timeDomainOption,
    updateChartView,
    updateMonth,
    updateTimeDomain
  } = props;
  
  return (
    <Centered>
      <Flex.Container alignItems="center" justifyContent="center">
        <Flex.Item>
          <MonthSelectorExclusive selected={selectedMonth} onChange={updateMonth} />
        </Flex.Item>

        <Flex.Item style={{ marginLeft: '1rem' }}>
          <ChartTypeSelector chartView={chartView} updateChartView={updateChartView} />
        </Flex.Item>

        <Flex.Item style={{ marginLeft: '1rem' }}>
          <TimeDomainSelector
            timeDomainOption={timeDomainOption}
            updateTimeDomain={updateTimeDomain}
          />
        </Flex.Item>
      </Flex.Container>
    </Centered>
  )
};
