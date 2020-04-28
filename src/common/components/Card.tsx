import * as React from 'react';
import MuiCard from '@material-ui/core/Card';
import classNames from 'classnames';

import { makeStylesHook } from '@nav/common/styles';


/** ============================ Types ===================================== */
type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  raised?: boolean;
  
  // style props
  padding?: number | string;
}

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook<CardProps>(() => ({
  card: props => ({
    padding: props.padding
  })
}), 'NavigaderCard');

/** ============================ Components ================================ */
export const Card: React.ComponentType<CardProps> = React.forwardRef(
  ({ className, ...rest }, ref) => {
    const classes = classNames(className, useStyles(rest).card);
    return <MuiCard className={classes} {...rest} ref={ref} />;
  }
);

Card.defaultProps = {
  padding: '1rem'
};
