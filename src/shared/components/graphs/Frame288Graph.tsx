import * as React from 'react';
import ContainerDimensions, { Dimensions } from 'react-container-dimensions';
import {
  DomainPropType, VictoryAxis, VictoryChart, VictoryLabel, VictoryLine, VictoryTheme,
  VictoryTooltip, VictoryVoronoiContainer
} from 'victory';
import flatten from 'lodash/flatten';
import range from 'lodash/range';

import { Frame288, Frame288LoadType } from '@nav/shared/models/meter';
import { primaryColor } from '@nav/shared/styles';
import { MonthIndex } from '@nav/shared/types';
import { getMonthName } from '@nav/shared/util';


/** ============================ Types ===================================== */
export type Frame288MonthsOption = MonthIndex[] | 'all';
type Frame288GraphProps = {
  data: Frame288;
  height?: number;
  loadType: Frame288LoadType;
  months?: Frame288MonthsOption;
};

type ScaleInfo = {
  scale: number;
  units: 'kW' | 'MW' | 'GW';
};

/** ============================ Styles ===================================== */
const lineStyle = {
  data: {
    opacity: 0.2,
    stroke: primaryColor,
    strokeWidth: 1.5
  },
  parent: {
    border: '1px solid #ccc'
  }
};

/** ============================ Components ================================ */
const Frame288Graph: React.FC<Frame288GraphProps> = (props) => {
  const { data, height, loadType, months = 'all' } = props;
  
  // Convert Frame288 to an array of objects
  const allMonths = range(1, 13) as MonthIndex[];
  let monthIndices: MonthIndex[];
  if (months === 'all') {
    monthIndices = allMonths;
  } else {
    monthIndices = months;
  }
  
  // Scale the data
  const allData = flatten(allMonths.map(i => data[i]));
  const min = Math.min(...allData);
  const max = Math.max(...allData);
  const { scale, units } = loadType === 'count'
    ? { scale: 1, units: 'kW' } as ScaleInfo
    : scaleData(min, max);
  
  // As the user changes which months they're viewing, we want to keep the graph's domain the
  // same-- it's jarring to see the axes jump
  const domain: DomainPropType = {
    x: [0, 23],
    y: [min / scale, max / scale]
  };
  
  const formattedData = monthIndices
    .map(monthIndex =>
      data[monthIndex].map((value, i) => ({
        x: i,
        y: value / scale
      }))
    );
  
  const yAxisLabel = loadType === 'count'
    ? 'Number of meter readings'
    : `Customer Load (${units})`;
  
  return (
    <ContainerDimensions>
      {({ width }: Dimensions) =>
        <VictoryChart
          containerComponent={<VictoryVoronoiContainer/>}
          height={height}
          domain={domain}
          domainPadding={{ y: 10 }}
          padding={{ left: 50, bottom: 30, top: 10, right: 0 }}
          theme={VictoryTheme.material}
          width={width}
        >
          <VictoryAxis tickValues={[3, 6, 9, 12, 15, 18, 21]} tickFormat={xAxisLabel} />
          <VictoryAxis
            crossAxis={false}
            dependentAxis
            label={yAxisLabel}
            axisLabelComponent={<VictoryLabel dy={-30} />}
          />
          
          {monthIndices.map((monthIndex, arrayIndex) =>
            <VictoryLine
              data={formattedData[arrayIndex]}
              key={monthIndex}
              labels={() => getMonthName(monthIndex)}
              labelComponent={<VictoryTooltip />}
              style={lineStyle}
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
  function xAxisLabel (hour: number) {
    const suffix = hour < 12 ? 'am' : 'pm';
    const formattedHour = hour === 0
      ? 12
      : hour <= 12
        ? hour
        : hour - 12;
    
    return formattedHour + suffix;
  }
};

/** ============================ Helpers =================================== */
/**
 * Gets the order of magnitude of the data to determine which units to render with
 *
 * @param {number} min: the minimum value of the data
 * @param {number} max: the maximum value of the data
 */
export function scaleData (min: number, max: number): ScaleInfo {
  const magnitude = Math.log10(Math.max(Math.abs(min), Math.abs(max)));
  if (magnitude >= 6) {
    return {
      scale: 1e6,
      units: 'GW'
    };
  } else if (magnitude >= 3) {
    return {
      scale: 1e3,
      units: 'MW'
    };
  } else {
    return {
      scale: 1,
      units: 'kW'
    };
  }
}

/** ============================ Exports =================================== */
export default Frame288Graph;
