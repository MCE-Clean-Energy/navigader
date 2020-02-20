import React from 'react';
import { createUseStyles } from 'react-jss';
import Card from '@material-ui/core/Card';
import classNames from 'classnames';


/** ============================ Types ===================================== */
type NavigaderCardProps = React.HTMLAttributes<HTMLDivElement> & {
  raised?: boolean;
  
  // style props
  padding?: number | string;
  styleOverrides?: React.CSSProperties
}

/** ============================ Styles ==================================== */
const useStyles = createUseStyles({
  card: (props: NavigaderCardProps) => ({
    padding: props.padding
  })
});

/** ============================ Components ================================ */
const NavigaderCard: React.FC<NavigaderCardProps> = ({ className, styleOverrides, ...rest }) => {
  const classes = useStyles(rest);
  const cardClasses = classNames(className, classes.card);
  return <Card className={cardClasses} style={styleOverrides} {...rest} />;
};

NavigaderCard.defaultProps = {
  padding: '1rem'
};

/** ============================ Exports =================================== */
export default NavigaderCard;
