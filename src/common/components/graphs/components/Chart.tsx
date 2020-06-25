import * as React from 'react';
import ContainerDimensions, { Dimensions } from 'react-container-dimensions';
import { VictoryChart } from 'victory';
import { VictoryChartProps } from 'victory-chart';

import { chartTheme, tooltipShadowId } from 'navigader/styles';


/** ============================ Types ===================================== */
type NavigaderChartProps = Omit<VictoryChartProps, 'theme'>;

/** ============================ Components ================================ */
export const NavigaderChart: React.FC<NavigaderChartProps> = ({ children, ...rest }) =>
  <ContainerDimensions>
    {({ width }: Dimensions) =>
      <VictoryChart theme={chartTheme} width={rest.width || width} {...rest}>
        {/* Creates the styling for tooltip drop shadows  */}
        <filter id={tooltipShadowId}>
          <feDropShadow stdDeviation="2"/>
        </filter>
        {children}
      </VictoryChart>
    }
  </ContainerDimensions>;
