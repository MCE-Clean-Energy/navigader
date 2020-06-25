import * as React from 'react';
import MuiTooltip from '@material-ui/core/Tooltip';

import { makeStylesHook } from 'navigader/styles';


/** ============================ Types ===================================== */
type TooltipPlacement =
  | 'bottom-end'
  | 'bottom-start'
  | 'bottom'
  | 'left-end'
  | 'left-start'
  | 'left'
  | 'right-end'
  | 'right-start'
  | 'right'
  | 'top-end'
  | 'top-start'
  | 'top';

type TooltipProps = {
  children: React.ReactElement;
  maxWidth?: React.CSSProperties['maxWidth'];
  placement?: TooltipPlacement;
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
export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  (props, ref) =>
    <MuiTooltip arrow classes={useStyles(props)} interactive ref={ref} {...props}>
      {props.children}
    </MuiTooltip>
);
