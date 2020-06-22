import * as React from 'react';
import ContainerDimensions, { Dimensions } from 'react-container-dimensions';
import {
  VictoryAxis, VictoryChart, VictoryLabel, VictoryLine, VictoryTheme, VictoryVoronoiContainer
} from 'victory';

import { ColorMap } from 'navigader/styles';
import { Frame288Numeric, Frame288NumericType, MonthIndex, MonthsOption } from 'navigader/types';
import { getMonthName } from 'navigader/util/formatters';
import { useColorMap } from 'navigader/util/hooks';
import _ from 'navigader/util/lodash';
import { getAxisLabel, VictoryCallbackArg } from './util';


/** ============================ Types ===================================== */
type Frame288GraphProps = {
  axisLabel?: string;
  data: Frame288Numeric | Frame288NumericType;
  months: MonthsOption;
  units?: string;
  width?: number;
};

type LineDatum = {
  monthIndex: MonthIndex;
  x: number;
  y: number;
};

/** ============================ Styles ===================================== */
const lineStyle = (colorMap: ColorMap) => ({
  data: {
    opacity: 0.5,
    stroke: colorMap.getColor('line')
  },
  parent: {
    border: '1px solid #ccc'
  }
});

/** ============================ Components ================================ */
export const Frame288Graph: React.FC<Frame288GraphProps> = (props) => {
  const { axisLabel, data, months, width: widthProp } = props;
  const monthIndices = months === 'all'
    ? _.range(1, 13) as MonthIndex[]
    : months;

  // Scale the data
  const frame = data instanceof Frame288Numeric ? data : new Frame288Numeric(data);
  const { units = frame.units } = props;
  const [min, max] = frame.getRange();

  // If the data changes without the component unmounting, get a new color map
  const colorMap = useColorMap([data]);

  // Convert frames to an array of objects
  const formattedData: LineDatum[][] = monthIndices.map(monthIndex =>
    frame.getMonth(monthIndex).map((value, i) => ({
      monthIndex,
      x: i,
      y: value
    }))
  );

  return (
    <ContainerDimensions>
      {({ width }: Dimensions) =>
        <VictoryChart
          containerComponent={
            <VictoryVoronoiContainer labels={lineLabel} responsive={!widthProp} />
          }
          height={300}
          domain={{
            x: [0, 23],
            y: [min, max]
          }}
          domainPadding={{ y: 10 }}
          padding={{ left: 50, bottom: 30, top: 10, right: 0 }}
          theme={VictoryTheme.material}
          width={widthProp || width}
        >
          <VictoryAxis tickValues={[3, 6, 9, 12, 15, 18, 21]} tickFormat={formatHour} />
          <VictoryAxis
            crossAxis={false}
            dependentAxis
            label={getAxisLabel(axisLabel, units)}
            axisLabelComponent={<VictoryLabel dy={-30} />}
          />

          {monthIndices.map((monthIndex, arrayIndex) =>
            <VictoryLine
              data={formattedData[arrayIndex]}
              key={monthIndex}
              style={lineStyle(colorMap)}
            />
          )}
        </VictoryChart>
      }
    </ContainerDimensions>
  );

  /** ============================ Callbacks =============================== */
  /**
   * Turns a 0-indexed hour into a human-friendly format (e.g. 0 --> "12am", 17 --> "5pm")
   *
   * @param {number} hour: the hour of the day to render
   */
  function formatHour (hour: number) {
    const realHour = Math.round(hour);
    const suffix = realHour < 12 ? 'am' : 'pm';
    const formattedHour = realHour === 0
      ? 12
      : realHour <= 12
        ? realHour
        : realHour - 12;

    return formattedHour + suffix;
  }
  
  /**
   * Creates the label for a point along a month-line
   *
   * @param {VictoryCallbackArg<LineDatum>} datum: the data point for which the label is made
   */
  function lineLabel ({ datum }: VictoryCallbackArg<LineDatum>) {
    const month = getMonthName(datum.monthIndex);
    const hour = formatHour(datum.x);
    const value = datum.y.toFixed(2);
    const suffix = units ? ` ${units}` : '';
    return `${month}, ${hour}: ${value}${suffix}`;
  }
};
