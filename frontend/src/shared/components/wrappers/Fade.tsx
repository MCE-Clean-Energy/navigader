import React, { CSSProperties } from 'react';
import Fade from '@material-ui/core/Fade';


/** ============================ Types ===================================== */
type NavigaderFadeProps = {
  in: boolean;
  style?: CSSProperties;
  unmountOnExit?: boolean;
};

/** ============================ Components ================================ */
const NavigaderFade: React.FC<NavigaderFadeProps> = props => <Fade {...props} />;

/** ============================ Exports =================================== */
export default NavigaderFade;
