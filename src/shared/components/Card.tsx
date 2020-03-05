import React from 'react';
import MuiCard from '@material-ui/core/Card';
import classNames from 'classnames';

import { makeStylesHook } from '@nav/shared/styles';


/** ============================ Types ===================================== */
type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  raised?: boolean;
  
  // style props
  padding?: number | string;
  styleOverrides?: React.CSSProperties
}

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook<CardProps>(() => ({
  card: props => ({
    padding: props.padding
  })
}));

/** ============================ Components ================================ */
export const Card: React.FC<CardProps> = ({ className, styleOverrides, ...rest }) => {
  const classes = useStyles(rest);
  const cardClasses = classNames(className, classes.card);
  return <MuiCard className={cardClasses} style={styleOverrides} {...rest} />;
};

Card.defaultProps = {
  padding: '1rem'
};
