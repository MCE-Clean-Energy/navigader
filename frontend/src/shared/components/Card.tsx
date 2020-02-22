import React from 'react';
import { createUseStyles } from 'react-jss';
import MuiCard from '@material-ui/core/Card';
import classNames from 'classnames';


/** ============================ Types ===================================== */
type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  raised?: boolean;
  
  // style props
  padding?: number | string;
  styleOverrides?: React.CSSProperties
}

/** ============================ Styles ==================================== */
const useStyles = createUseStyles({
  card: (props: CardProps) => ({
    padding: props.padding
  })
});

/** ============================ Components ================================ */
export const Card: React.FC<CardProps> = ({ className, styleOverrides, ...rest }) => {
  const classes = useStyles(rest);
  const cardClasses = classNames(className, classes.card);
  return <MuiCard className={cardClasses} style={styleOverrides} {...rest} />;
};

Card.defaultProps = {
  padding: '1rem'
};
