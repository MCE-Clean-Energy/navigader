import React from 'react';
import { VictoryChart, VictoryLine, VictoryTheme } from 'victory';

import { Frame288 } from '@nav/shared/models/meter';
import { primaryColor } from '@nav/shared/styles';


/** ============================ Types ===================================== */
type Frame288GraphProps = {
  data: Frame288;
  height?: number;
  width?: number;
};

/** ============================ Components ================================ */
const Frame288Graph: React.FC<Frame288GraphProps> = (props) => {
  const { data, height, width } = props;
  
  // Convert Frame288 to an array of objects
  const monthData = data[1];
  const formattedData = monthData.map((value, i) => ({
    x: i,
    y: value
  }));
  
  return (
    <VictoryChart
      height={height}
      maxDomain={{ y: Math.max(...monthData) + 1 }}
      padding={{ left: 50, bottom: 30, top: 10, right: 0 }}
      theme={VictoryTheme.material}
      width={width}
    >
      <VictoryLine
        style={{
          data: { stroke: primaryColor },
          parent: { border: "1px solid #ccc"}
        }}
        data={formattedData}
      />
    </VictoryChart>
  );
};

/** ============================ Exports =================================== */
export default Frame288Graph;
