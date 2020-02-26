import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';


/** ============================ Types ===================================== */
type ProgressProps = {
  circular?: boolean
};

/** ============================ Components ================================ */
export const Progress: React.FC<ProgressProps> = ({ circular, ...rest }) => {
  const Component = circular ? CircularProgress : LinearProgress;
  return <Component {...rest} />;
};
