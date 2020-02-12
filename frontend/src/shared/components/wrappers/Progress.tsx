import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';


/** ============================ Types ===================================== */
type NavigaderProgressProps = {
  circular?: boolean
};

/** ============================ Components ================================ */
const NavigaderProgress: React.FC<NavigaderProgressProps> = ({ circular, ...rest }) => {
  const Component = circular ? CircularProgress : LinearProgress;
  return <Component {...rest} />;
};

/** ============================ Exports =================================== */
export default NavigaderProgress;
