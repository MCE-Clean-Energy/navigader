import * as React from 'react';
import MuiFade from '@material-ui/core/Fade';
import { TransitionProps } from '@material-ui/core/transitions';


/** ============================ Components ================================ */
export const Fade: React.FC<TransitionProps> = props => <MuiFade {...props} />;
