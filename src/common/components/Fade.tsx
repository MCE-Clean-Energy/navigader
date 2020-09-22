import * as React from 'react';
import MuiFade from '@material-ui/core/Fade';
import { TransitionProps } from '@material-ui/core/transitions';


/** ============================ Types ===================================== */
type FadeProps = TransitionProps & {
  children?: React.ReactElement<any, any>;
};

/** ============================ Components ================================ */
export const Fade: React.FC<FadeProps> = props => <MuiFade {...props} />;
