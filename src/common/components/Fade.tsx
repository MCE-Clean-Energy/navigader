import * as React from 'react';
import MuiFade from '@material-ui/core/Fade';


/** ============================ Types ===================================== */
type FadeProps = {
  in: boolean;
  style?: React.CSSProperties;
  unmountOnExit?: boolean;
};

/** ============================ Components ================================ */
export const Fade: React.FC<FadeProps> = props => <MuiFade {...props} />;
