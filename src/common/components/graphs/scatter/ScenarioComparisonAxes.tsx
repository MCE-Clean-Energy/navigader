import * as React from 'react';

import { makeStylesHook } from 'navigader/styles';
import { ScenarioImpactColumn, Tuple } from 'navigader/types';
import { Select } from '../../Select';
import { Typography } from '../../Typography';

/** ============================ Types ===================================== */
export type ScenarioComparisonChartAxes = Tuple<ScenarioImpactColumn>;
type ChartTitleProps = {
  aggregated?: boolean;
  averaged?: boolean;
  axes: ScenarioComparisonChartAxes;
  updateAxes: (newAxes: ScenarioComparisonChartAxes) => void;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(
  (theme) => ({
    wrapper: {
      'marginBottom': theme.spacing(1),
      '& > *:not(:first-child)': {
        marginLeft: theme.spacing(2),
      },
    },
  }),
  'ChartTitle'
);

/** ============================ Components ================================ */
const TitleText: React.FC = (props) => (
  <Typography {...props} emphasis="bold" variant="subtitle1" />
);
export const ScenarioComparisonChartTitle: React.FC<ChartTitleProps> = (props) => {
  const { aggregated, averaged, axes, updateAxes } = props;
  const classes = useStyles();
  const axisOptions: ScenarioImpactColumn[] = [
    'Usage',
    'GHG',
    'Procurement',
    'RA',
    'Revenue',
    'Expense',
    'Profit',
  ];

  const AxisSelect: React.FC<{ index: 0 | 1 }> = ({ index }) => (
    <Select
      onChange={updateAxis(index)}
      options={axisOptions}
      renderOption={renderAxisOption}
      value={axes[index]}
    />
  );

  return (
    <div className={classes.wrapper}>
      <AxisSelect index={0} />
      <TitleText>vs.</TitleText>
      <AxisSelect index={1} />
      {aggregated && averaged && <TitleText>per Customer</TitleText>}
    </div>
  );

  /** ========================== Callbacks ================================= */
  function updateAxis(index: number) {
    return (newAxis: ScenarioImpactColumn) => {
      updateAxes(index === 0 ? [newAxis, axes[1]] : [axes[0], newAxis]);
    };
  }

  function renderAxisOption(axis: ScenarioImpactColumn) {
    return `${axis} Impacts`;
  }
};

/** ============================ Helpers =================================== */
export function getAxisLabel(axis: ScenarioImpactColumn) {
  switch (axis) {
    case 'GHG':
      return 'GHG Impacts (tCO2/year)';
    case 'Procurement':
      return 'Procurement Impacts ($/year)';
    case 'RA':
      return 'RA Impacts ($/year)';
    case 'Usage':
      return 'Usage Impacts (kW/year)';
    case 'Revenue':
      return 'Revenue Impacts ($/year)';
    case 'Expense':
      return 'Expense Impacts ($/year)';
    case 'Profit':
      return 'Profit Impacts ($/year)';
  }
}
