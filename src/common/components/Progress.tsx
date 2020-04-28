import * as React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';


/** ============================ Types ===================================== */
type ProgressVariant = 'determinate' | 'indeterminate';
type ProgressProps = {
  circular?: boolean;
  className?: string;
  value?: number;
};

/** ============================ Components ================================ */
export const Progress: React.FC<ProgressProps> = ({ circular, ...rest }) => {
  const progressProps = {
    ...rest,
    variant: rest.value !== undefined ? 'determinate' : 'indeterminate' as ProgressVariant
  };
  
  const Component = circular ? CircularProgress : LinearProgress;
  return <Component {...progressProps} />;
};
