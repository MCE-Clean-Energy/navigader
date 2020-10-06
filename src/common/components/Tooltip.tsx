import * as React from 'react';
import MuiTooltip from '@material-ui/core/Tooltip';

import { makeStylesHook } from 'navigader/styles';
import { Fade } from './Fade';


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
  delay?: number | boolean;
  maxWidth?: React.CSSProperties['maxWidth'];
  placement?: TooltipPlacement;
  title: React.ReactNode;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook<Pick<TooltipProps, 'maxWidth'>>(theme => ({
  tooltip: props => ({
    fontSize: theme.typography.body2.fontSize,
    maxWidth: props.maxWidth
  })
}), 'Tooltip');

// Length of the transition's duration and delay, in milliseconds
const defaultDelay = 1000;

/** ============================ Components ================================ */
export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ children, delay, title, ...rest }, ref) => {
    const classes = useStyles(rest);

    // Compute the tooltip's delay
    const enterDelay = React.useMemo(() => {
      switch (typeof delay) {
        case 'boolean': return defaultDelay;
        case 'number': return delay;
        default: return 0;
      }
    }, [delay]);

    if (!title) return children;
    return (
      <MuiTooltip
        arrow
        classes={classes}
        enterDelay={enterDelay}
        interactive
        ref={ref}
        title={title}
        TransitionComponent={Fade}
        {...rest}
      >
        {children}
      </MuiTooltip>
    );
  }
);
