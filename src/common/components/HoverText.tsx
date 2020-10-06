import * as React from 'react';

import { makeStylesHook} from 'navigader/styles';
import { Popover } from './Popover';
import { Typography } from './Typography';


/** ============================ Types ===================================== */
type HoverTextProps = {
  HoverComponent: React.ReactNode
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  hoverText: {
    cursor: 'default',
    textDecoration: `underline dotted ${theme.palette.primary.main}`,

    '&:hover': {
      color: theme.palette.primary.main
    }
  }
}), 'NavigaderHoverText');

/** ============================ Components ================================ */
export const HoverText: React.FC<HoverTextProps> = (props) => {
  const { children, ...rest} = props;
  const classes = useStyles();
  return (
    <Popover {...rest}>
      <Typography className={classes.hoverText}>
        {props.children}
      </Typography>
    </Popover>
  );
};
