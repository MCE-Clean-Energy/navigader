import * as React from 'react';
import {
  VictoryAxis,
  VictoryLabel,
  VictoryScatter,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from 'victory';
import { VictoryLabelProps } from 'victory-core';
import { useTheme } from '@material-ui/core';

import { ColorMap, primaryColor } from 'navigader/styles';
import { omitFalsey } from 'navigader/util';
import _ from 'navigader/util/lodash';
import { NavigaderChart } from '../components';
import { VictoryCallbackArg } from '../util';
import { ScatterConfig, ScatterDatum, ScatterPlotDatumWrapper } from './types';

/** ============================ Types ===================================== */
type ScatterPlotProps = {
  colorMap?: ColorMap;
  data: ScatterPlotDatumWrapper[];
  highlight?: string;
  xAxisLabel: string;
  yAxisLabel: string;
};

/** ============================ Styles ==================================== */
const CHART_MARGIN = 15;
const CHART_LABEL_OFFSET = 35;

/** ============================ Components ================================ */
const ChartLabel: React.FC<VictoryLabelProps> = ({ style, ...rest }) => {
  const theme = useTheme();
  return <VictoryLabel {...rest} style={getStyle()} />;

  /** ========================== Helpers =================================== */
  function getStyle() {
    if (!style || Array.isArray(style)) return style;
    return {
      ...style,
      fill: theme.palette.text.secondary,
      textAnchor: rest.textAnchor || style.textAnchor,
    } as React.CSSProperties;
  }
};

export const ScatterPlot: React.FC<ScatterPlotProps> = (props) => {
  const { colorMap, data, highlight, xAxisLabel, yAxisLabel } = props;
  const config = buildChartConfiguration(data, colorMap);
  return (
    <NavigaderChart
      containerComponent={
        <VictoryVoronoiContainer
          labelComponent={<VictoryTooltip constrainToVisibleArea pointerLength={0} />}
          labels={pointLabel}
          responsive
        />
      }
      domain={config.domain}
      domainPadding={30}
      height={500}
      padding={CHART_MARGIN}
    >
      <VictoryAxis
        axisLabelComponent={
          <ChartLabel x={0} dx={CHART_MARGIN} dy={-CHART_LABEL_OFFSET} textAnchor="start" />
        }
        label={xAxisLabel}
      />

      <VictoryAxis
        axisLabelComponent={
          <ChartLabel y={0} dx={-CHART_MARGIN} dy={CHART_LABEL_OFFSET} textAnchor="end" />
        }
        dependentAxis
        label={yAxisLabel}
      />

      <VictoryScatter
        data={config.data}
        style={{
          data: {
            fill: ({ datum }: VictoryCallbackArg<ScatterDatum>) => {
              return datum.id === highlight ? 'red' : datum.color;
            },
            opacity: ({ datum }: VictoryCallbackArg<ScatterDatum>) => {
              return datum.id === highlight ? 1 : 0.5;
            },
          },
        }}
        x="xValue"
        y="yValue"
      />
    </NavigaderChart>
  );
};

/** ============================ Helpers =================================== */
function pointLabel({ datum }: VictoryCallbackArg<ScatterDatum>) {
  return datum.tooltip;
}

/**
 * Produces configuration for rendering the scatter plot. This includes the domain of the
 * chart, the domain's padding and the sizing function.
 *
 * @param {ScatterPlotDatumWrapper[]} wrappedData: the wrapped scatter data
 * @param {ColorMap} [colorMap]: the color map used for filling the scatter points
 */
function buildChartConfiguration(
  wrappedData: ScatterPlotDatumWrapper[],
  colorMap?: ColorMap
): ScatterConfig {
  // These are set in the data loop
  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;

  const data = omitFalsey(
    wrappedData.map((datum) => {
      const xValue = datum.x;
      const yValue = datum.y;

      // If the xValue or yValue are `null` don't render this point
      if (typeof xValue !== 'number' || typeof yValue !== 'number') return null;

      // Check if the xValue and yValue are the new min or max of their respective axes
      if (xValue < xMin) xMin = xValue;
      if (xValue > xMax) xMax = xValue;
      if (yValue < yMin) yMin = yValue;
      if (yValue > yMax) yMax = yValue;

      return {
        ..._.pick(datum, ['name']),
        color: colorMap?.getColor(datum.colorId) || primaryColor,
        id: datum.id,
        tooltip: datum.tooltipText,
        size: datum.size,
        xValue,
        yValue,
      };
    })
  );

  // To center the origin in the graph, the axes extend equally on both sides
  const xMaxAbsolute = getMaxAbsolute(xMin, xMax);
  const yMaxAbsolute = getMaxAbsolute(yMin, yMax);

  return {
    data,
    domain: {
      x: [-xMaxAbsolute, xMaxAbsolute],
      y: [-yMaxAbsolute, yMaxAbsolute],
    },
  };
}

/**
 * Helper for building the chart domain, with graceful management of infinite values
 *
 * @param {number} val1: the first value
 * @param {number} val2: the second value
 */
function getMaxAbsolute(val1: number, val2: number) {
  const isInfinite1 = !isFinite(val1);
  const isInfinite2 = !isFinite(val2);

  // If neither value is finite, return an arbitrary number. This prevents glitchy rendering
  if (isInfinite1 && isInfinite2) return 100;

  // Otherwise at least one of the values is finite. If they both are, return the greater of the
  // two's absolute values. If only one is, return its absolute value.
  const absoluteValue1 = Math.abs(val1);
  const absoluteValue2 = Math.abs(val2);

  if (isInfinite1) return absoluteValue2;
  if (isInfinite2) return absoluteValue1;
  return Math.max(absoluteValue1, absoluteValue2);
}
