import * as React from 'react';

import logo from 'navigader/images/logo.png';
import { makeStylesHook } from 'navigader/styles';

/** ============================ Types ===================================== */
type LogoProps = {
  width?: number | string;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook<LogoProps>(
  () => ({
    logo: (props) => ({
      width: props.width,
    }),
  }),
  'Logo'
);

/** ============================ Components ================================ */
export const Logo: React.FC<LogoProps> = (props) => {
  const classes = useStyles(props);
  return <img src={logo} className={classes.logo} alt="NavigaDER Logo" />;
};

Logo.defaultProps = {
  width: '100%',
};
