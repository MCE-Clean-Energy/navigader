import * as React from 'react';
import {
  VictoryAxis, VictoryLabel, VictoryScatter, VictoryTooltip, VictoryVoronoiContainer
} from 'victory';
import { VictoryLabelProps } from 'victory-core';
import { useTheme } from '@material-ui/core'

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
  function getStyle () {
    if (!style || Array.isArray(style)) return style;
    return {
      ...style,
      fill: theme.palette.text.secondary,
      textAnchor: rest.textAnchor || style.textAnchor
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
        axisLabelComponent={<ChartLabel x={0} dx={CHART_MARGIN} dy={-CHART_LABEL_OFFSET} textAnchor="start" />}
        label={xAxisLabel}
      />

      <VictoryAxis
        axisLabelComponent={<ChartLabel y={0} dx={-CHART_MARGIN} dy={CHART_LABEL_OFFSET} textAnchor="end" />}
        dependentAxis
        label={yAxisLabel}
      />

      <VictoryScatter
        data={config.data}
        style={{
          data: {
            fill: ({ datum }: VictoryCallbackArg<ScatterDatum>) => {
              return datum.id === highlight
                ? 'red'
                : datum.color;
            },
            opacity: ({ datum }: VictoryCallbackArg<ScatterDatum>) => {
              return datum.id === highlight
                ? 1
                : 0.5;
            }
          }
        }}
        x="xValue"
        y="yValue"
      />
    </NavigaderChart>
  );
};

/** ============================ Helpers =================================== */
function pointLabel ({ datum }: VictoryCallbackArg<ScatterDatum>) {
  return datum.tooltip;
}

/**
 * Produces configuration for rendering the scatter plot. This includes the domain of the
 * chart, the domain's padding and the sizing function.
 *
 * @param {ScatterPlotDatumWrapper[]} wrappedData: the wrapped scatter data
 * @param {ColorMap} [colorMap]: the color map used for filling the scatter points
 */
function buildChartConfiguration (
  wrappedData: ScatterPlotDatumWrapper[],
  colorMap?: ColorMap
): ScatterConfig {
  // These are set in the data loop
  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;

  const data = omitFalsey(wrappedData.map((datum) => {
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
      yValue
    };
  }));

  // To center the origin in the graph, the axes extend equally on both sides
  const xMaxAbsolute = Math.max(Math.abs(xMin), Math.abs(xMax));
  const yMaxAbsolute = Math.max(Math.abs(yMin), Math.abs(yMax));

  return {
    data,
    domain: {
      x: [-xMaxAbsolute, xMaxAbsolute],
      y: [-yMaxAbsolute, yMaxAbsolute]
    }
  };
}
