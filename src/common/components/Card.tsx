import * as React from 'react';
import MuiCard from '@material-ui/core/Card';
import MuiCardActionArea from '@material-ui/core/CardActionArea';
import MuiCardActions from '@material-ui/core/CardActions';
import MuiCardContent from '@material-ui/core/CardContent';
import MuiCardMedia from '@material-ui/core/CardMedia';
import classNames from 'classnames';

import { makeStylesHook } from 'navigader/styles';


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
export const Card = Object.assign(
  React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, ...rest }, ref) => {
      const classes = classNames(className, useStyles(rest).card);
      return <MuiCard className={classes} {...rest} ref={ref} />;
    }
  ), {
    ActionArea: MuiCardActionArea,
    Actions: MuiCardActions,
    Content: MuiCardContent,
    Media: MuiCardMedia
  }
);

Card.defaultProps = {
  padding: '1rem'
};
