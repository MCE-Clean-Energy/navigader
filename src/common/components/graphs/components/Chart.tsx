import * as React from 'react';
import ContainerDimensions, { Dimensions } from 'react-container-dimensions';
import { VictoryChart } from 'victory';
import { VictoryChartProps } from 'victory-chart';

import { chartTheme, makeStylesHook, tooltipShadowId } from 'navigader/styles';


/** ============================ Types ===================================== */
type NavigaderChartProps = Omit<VictoryChartProps, 'theme'>;

/** ============================ Styles ===================================== */
const useStyles = makeStylesHook(() => ({
  container: {
    '& svg': {
      overflow: 'visible'
    }
  }
}), 'NavigaderChart');

/** ============================ Components ================================ */
// Creates the styling for tooltip drop shadows
const TooltipShadows: React.FC = () =>
  <filter id={tooltipShadowId}>
    <feDropShadow stdDeviation="2" />
  </filter>;

export const NavigaderChart: React.FC<NavigaderChartProps> = ({ children, ...rest }) =>
  <div className={useStyles().container}>
    <ContainerDimensions>
      {({ width }: Dimensions) =>
        <VictoryChart theme={chartTheme} width={rest.width || width} {...rest}>
          <TooltipShadows />
          {children}
        </VictoryChart>
      }
    </ContainerDimensions>
  </div>;
