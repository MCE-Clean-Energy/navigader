import * as React from 'react';
import MuiTooltip from '@material-ui/core/Tooltip';


/** ============================ Types ===================================== */
type TooltipProps = {
  children: React.ReactElement;
  title: React.ReactNode;
};

/** ============================ Components ================================ */
export const Tooltip: React.FC<TooltipProps> = (props) =>
  <MuiTooltip arrow interactive {...props}>
    {props.children}
  </MuiTooltip>;
