import React from 'react';
import {
  DomainPropType,
  VictoryChart,
  VictoryLine,
  VictoryTheme,
  VictoryTooltip,
  VictoryVoronoiContainer
} from 'victory';
import flatten from 'lodash/flatten';
import range from 'lodash/range';

import { Frame288 } from '@nav/shared/models/meter';
import { primaryColor } from '@nav/shared/styles';
import { MonthIndex } from '@nav/shared/types';
import { getMonthName } from '@nav/shared/util';


/** ============================ Types ===================================== */
export type Frame288MonthsOption = MonthIndex[] | 'all';
type Frame288GraphProps = {
  data: Frame288;
  height?: number;
  months?: Frame288MonthsOption;
  width?: number;
};

/** ============================ Styles ===================================== */
const lineStyle = {
  data: {
    opacity: 0.2,
    stroke: primaryColor,
    strokeWidth: 1
  },
  parent: {
    border: '1px solid #ccc'
  }
};

/** ============================ Components ================================ */
const Frame288Graph: React.FC<Frame288GraphProps> = (props) => {
  const { data, height, months = 'all', width } = props;
  
  // Convert Frame288 to an array of objects
  const allMonths = range(1, 13) as MonthIndex[];
  let monthIndices: MonthIndex[];
  if (months === 'all') {
    monthIndices = allMonths;
  } else {
    monthIndices = months;
  }
  
  // Compute the full extent of the data regardless of which portion of it we're rendering. As the
  // user changes which months they're viewing, it's jarring to see the axes jump
  const allData = flatten(allMonths.map(i => data[i]));
  const domain: DomainPropType = {
    x: [0, 23],
    y: [Math.min(...allData), Math.max(...allData)]
  };
  
  const formattedData = monthIndices
    .map(monthIndex =>
      data[monthIndex].map((value, i) => ({
        x: i,
        y: value
      }))
    );
  
  return (
    <VictoryChart
      containerComponent={<VictoryVoronoiContainer/>}
      height={height}
      domain={domain}
      padding={{ left: 50, bottom: 30, top: 10, right: 0 }}
      theme={VictoryTheme.material}
      width={width}
    >
      {formattedData.map((monthData, monthIndex) =>
        <VictoryLine
          data={monthData}
          key={monthIndex}
          labels={() => getMonthName(monthIndex + 1 as MonthIndex)}
          labelComponent={<VictoryTooltip />}
          style={lineStyle}
        />
      )}
    </VictoryChart>
  );
};

/** ============================ Exports =================================== */
export default Frame288Graph;
