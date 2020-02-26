import React from 'react';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';


/** ============================ Types ===================================== */
type CenteredProps = React.HTMLAttributes<HTMLDivElement>;

/** ============================ Styles ==================================== */
const useStyles = createUseStyles({
  wrapper: {
    textAlign: 'center'
  }
});

/** ============================ Components ================================ */
export const Centered: React.FC<CenteredProps> = ({ className, ...rest }) => {
  const styles = useStyles();
  const classes = classNames(styles.wrapper, className);
  return <div className={classes} {...rest} />;
};
