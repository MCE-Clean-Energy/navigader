import * as React from 'react';
import classNames from 'classnames';

import { makeStylesHook } from '@nav/common/styles';


/** ============================ Types ===================================== */
type CenteredProps = React.HTMLAttributes<HTMLDivElement>;

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(() => ({
  wrapper: {
    textAlign: 'center'
  }
}), 'NavigaderCentered');

/** ============================ Components ================================ */
export const Centered: React.FC<CenteredProps> = ({ className, ...rest }) => {
  const styles = useStyles();
  const classes = classNames(styles.wrapper, className);
  return <div className={classes} {...rest} />;
};
