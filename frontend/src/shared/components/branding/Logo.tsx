import React from 'react';
import { createUseStyles } from 'react-jss';

import logo from '@nav/shared/images/logo.png';


/** ============================ Types ===================================== */
type LogoProps = {
  width?: number | string;
};

/** ============================ Styles ==================================== */
const useStyles = createUseStyles({
  logo: (props: LogoProps) => ({
    width: props.width
  })
});

/** ============================ Components ================================ */
export const Logo: React.FC<LogoProps> = (props) => {
  const classes = useStyles(props);
  return <img src={logo} className={classes.logo} alt="NavigaDER Logo" />;
};

Logo.defaultProps = {
  width: '100%'
};
