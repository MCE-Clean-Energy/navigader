import * as React from 'react';
import MuiTooltip from '@material-ui/core/Tooltip';

import { makeStylesHook } from 'navigader/styles';


/** ============================ Types ===================================== */
type TooltipProps = {
  children: React.ReactElement;
  maxWidth?: React.CSSProperties['maxWidth'];
  title: React.ReactNode;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook<TooltipProps>(theme => ({
  tooltip: props => ({
    fontSize: theme.typography.body2.fontSize,
    maxWidth: props.maxWidth
  })
}), 'Tooltip');

/** ============================ Components ================================ */
export const Tooltip: React.FC<TooltipProps> = (props) => {
  const classes = useStyles(props);
  return (
    <MuiTooltip arrow classes={classes} interactive {...props}>
      {props.children}
    </MuiTooltip>
  );
};
