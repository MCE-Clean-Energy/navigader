import * as React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';

import { makeStylesHook } from '@nav/common/styles';
import { printWarning } from '@nav/common/util';


/** ============================ Types ===================================== */
type ProgressVariant = 'determinate' | 'indeterminate';
type ProgressProps = {
  circular?: boolean;
  className?: string;
  showBackground?: boolean;
  value?: number;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  root: {
    position: 'relative',
  },
  background: {
    color: theme.palette.grey[100],
    left: 0,
    position: 'absolute'
  }
}), 'Progress');

/** ============================ Components ================================ */
export const Progress: React.ComponentType<ProgressProps> = React.forwardRef(
  ({ circular, showBackground, ...rest }, ref) => {
    const classes = useStyles();
    const progressProps = {
      ...rest,
      variant: rest.value !== undefined ? 'determinate' : 'indeterminate' as ProgressVariant
    };
    
    if (showBackground && !circular) {
      printWarning('`Progress` component was provided `showBackground` prop without `circular`' +
        ' prop. `showBackground` only works with circular progress wheels.');
    }

    if (circular) {
      const progress = <CircularProgress {...progressProps} ref={ref} />;
      if (!showBackground) return progress;
      
      return (
        <div className={classes.root}>
          <CircularProgress
            className={classes.background}
            disableShrink
            value={100}
            variant="determinate"
          />
          {progress}
        </div>
      );
    }
    
    return <LinearProgress {...progressProps} ref={ref} />;
  }
);
