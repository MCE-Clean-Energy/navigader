import * as React from 'react';

import { makeStylesHook} from '@nav/shared/styles';
import { randomString} from '@nav/shared/util';
import { Popover } from './Popover';
import { Typography } from './Typography';


/** ============================ Types ===================================== */
type HoverTextProps = {
  HoverComponent: React.ReactNode
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  hoverContainer: {
    padding: theme.spacing(2)
  },
  hoverText: {
    cursor: 'default',
    textDecoration: `underline dotted ${theme.palette.primary.main}`,
    
    '&:hover': {
      color: theme.palette.primary.main
    }
  },
  popover: {
    pointerEvents: 'none'
  }
}), 'NavigaderHoverText');

/** ============================ Components ================================ */
export const HoverText: React.FC<HoverTextProps> = (props) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLSpanElement | null>(null);
  const classes = useStyles();
  
  const popoverId = randomString();
  const open = Boolean(anchorEl);
  
  return (
    <div>
      <Typography
        aria-owns={open ? popoverId : undefined}
        aria-haspopup="true"
        className={classes.hoverText}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        {props.children}
      </Typography>
      
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        className={classes.popover}
        id={popoverId}
        onClose={handlePopoverClose}
        open={open}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <div className={classes.hoverContainer}>
          {props.HoverComponent}
        </div>
      </Popover>
    </div>
  );
  
  /** ============================ Callbacks =============================== */
  function handlePopoverClose () {
    setAnchorEl(null);
  }
  
  function handlePopoverOpen (event: React.MouseEvent<HTMLElement, MouseEvent>) {
    setAnchorEl(event.currentTarget);
  }
};
