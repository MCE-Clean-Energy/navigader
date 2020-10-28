import * as React from 'react';
import ContainerDimensions, { Dimensions } from 'react-container-dimensions';
import { VictoryChart, VictoryTheme } from 'victory';
import { VictoryChartProps } from 'victory-chart';
import { VictoryThemeDefinition } from 'victory-core';
import classNames from 'classnames';

import { makeStylesHook, materialColors } from 'navigader/styles';
import { randomString } from 'navigader/util';
import _ from 'navigader/util/lodash';

/** ============================ Types ===================================== */
type NavigaderChartProps = Omit<VictoryChartProps, 'theme'> & {
  className?: string;
};

/** ============================ Styles ===================================== */
const useStyles = makeStylesHook(
  () => ({
    container: {
      '& svg': {
        overflow: 'visible',
      },
    },
  }),
  'NavigaderChart'
);

// Colors
const blueGrey50 = materialColors.blueGrey[50];
const blueGrey300 = materialColors.blueGrey[300];
const blueGrey700 = materialColors.blueGrey[700];

// Labels
const baseLabelStyles = {
  fontFamily: "'Roboto', 'Helvetica Neue', Helvetica, sans-serif",
  fontSize: 14,
  letterSpacing: 'normal',
  padding: 8,
  fill: blueGrey700,
};

const centeredLabelStyles = { textAnchor: 'middle', ...baseLabelStyles };

// Strokes
const strokeLinecap = 'round';
const strokeLinejoin = 'round';

/** ============================ Components ================================ */
// Creates the styling for tooltip drop shadows
const TooltipShadows: React.FC<{ id: string }> = ({ id }) => (
  <filter id={getFilterId(id)}>
    <feDropShadow stdDeviation="2" />
  </filter>
);

export const NavigaderChart: React.FC<NavigaderChartProps> = ({ children, className, ...rest }) => {
  const chartId = React.useMemo(() => randomString(), []);

  return (
    <div className={classNames(useStyles().container, className)}>
      <ContainerDimensions>
        {({ width }: Dimensions) => (
          <VictoryChart theme={getChartTheme(chartId)} width={rest.width || width} {...rest}>
            <TooltipShadows id={chartId} />
            {children}
          </VictoryChart>
        )}
      </ContainerDimensions>
    </div>
  );
};

/** ============================ Helpers =================================== */
/**
 * Produces the theme object to use with the chart.
 *
 * @param {string} chartId: the ID of the chart. This is used to identify the `<filter>` element
 *   containing the drop-shadow styles for tooltips. The ID must be chart-specific, because if
 *   multiple charts are rendered simultaneously there will be multiple `<filter>` elements on the
 *   page simultaneously.
 */
function getChartTheme(chartId: string): VictoryThemeDefinition {
  return _.merge({}, VictoryTheme.material, {
    area: {
      style: {
        data: {
          opacity: 0.3,
        },
      },
    },
    axis: {
      style: {
        axis: {
          stroke: blueGrey300,
          strokeWidth: 2,
          strokeLinecap,
          strokeLinejoin,
        },
        axisLabel: {
          ...centeredLabelStyles,
          padding: 15,
        },
        grid: {
          stroke: blueGrey50,
          strokeDasharray: '5, 5',
          strokeLinecap,
          strokeLinejoin,
        },
        ticks: {
          size: 5,
          stroke: blueGrey300,
          strokeWidth: 1,
          strokeLinecap,
          strokeLinejoin,
        },
        tickLabels: baseLabelStyles,
      },
    },
    legend: {
      orientation: 'horizontal',
      style: {
        data: {
          type: 'circle',
          opacity: 0.5,
        },
        labels: baseLabelStyles,
      },
    },
    line: {
      style: {
        data: {
          opacity: 0.3,
          strokeWidth: 2,
        },
        labels: centeredLabelStyles,
      },
    },
    tooltip: {
      cornerRadius: 5,
      pointerLength: 10,
    },
    voronoi: {
      style: {
        labels: {
          ...centeredLabelStyles,
          padding: 5,
          pointerEvents: 'none',
        },
        flyout: {
          filter: `url(#${getFilterId(chartId)})`,
          fontSize: 16,
          strokeWidth: 0,
          fill: materialColors.grey[200],
          pointerEvents: 'none',
        },
      },
    },
  });
}

function getFilterId(chartId: string) {
  return `${chartId}-tooltip-drop-shadow`;
}
