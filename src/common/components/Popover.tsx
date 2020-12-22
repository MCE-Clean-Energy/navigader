import classNames from 'classnames';
import * as React from 'react';
import MuiPopover from '@material-ui/core/Popover';
import { BaseCSSProperties } from '@material-ui/core/styles/withStyles';

import { makeStylesHook, Theme } from 'navigader/styles';
import { hooks } from 'navigader/util';

/** ============================ Types ===================================== */
export type PopoverOrigin = {
  vertical: 'top' | 'center' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
};

type PopoverProps = {
  anchorOrigin?: PopoverOrigin;
  className?: string;
  HoverComponent: React.ReactNode;
  padding?: number;
  transformOrigin?: PopoverOrigin;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook<PopoverProps>(
  (theme) => ({
    hoverContainer: ({ padding = 0 }) => ({ padding: theme.spacing(padding) }),
    paper: (props) => ({ ...getPaperStyle(props, theme) }),
    popover: {
      pointerEvents: 'none',
    },
  }),
  'NavigaderPopover'
);

// By default, the Popover will appear centered above the anchor element
const DEFAULT_ANCHOR_ORIGIN: PopoverOrigin = { vertical: 'top', horizontal: 'center' };
const DEFAULT_TRANSFORM_ORIGIN: PopoverOrigin = { vertical: 'bottom', horizontal: 'center' };

/** ============================ Components ================================ */
export const Popover: React.FC<PopoverProps> = (props) => {
  const {
    anchorOrigin = DEFAULT_ANCHOR_ORIGIN,
    transformOrigin = DEFAULT_TRANSFORM_ORIGIN,
    children,
    className,
    HoverComponent,
  } = props;

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const classes = useStyles(props);

  const popoverId = hooks.useRandomString();
  const open = Boolean(anchorEl);

  return (
    <div>
      <div
        aria-owns={open ? popoverId : undefined}
        aria-haspopup="true"
        className={classes.wrapper}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        {children}
      </div>

      <MuiPopover
        anchorEl={anchorEl}
        anchorOrigin={anchorOrigin}
        className={classes.popover}
        classes={{
          paper: classes.paper,
        }}
        id={popoverId}
        onClose={handlePopoverClose}
        open={open}
        transformOrigin={transformOrigin}
      >
        <div className={classNames(classes.hoverContainer, className)}>{HoverComponent}</div>
      </MuiPopover>
    </div>
  );

  /** ========================== Callbacks ================================= */
  function handlePopoverClose() {
    setAnchorEl(null);
  }

  function handlePopoverOpen(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    setAnchorEl(event.currentTarget);
  }
};

/** ============================ Helpers =================================== */
/**
 * Returns the CSS properties that will be applied to the `Popover`'s `Paper` element. The objective
 * is to provide some spacing between the anchor and the Paper. For example, If the Paper is
 * meant to render to the left of the anchor, then we will move it to the left with a
 * negative `marginLeft` property, if it is meant to render below the anchor, we will move it down
 * with a positive `marginTop` property, and if it is meant to render above and to the right of the
 * anchor, we will move it right and up with a combination of both
 *
 * @param {PopoverProps} props: the props to the component
 * @param {Theme} theme: the theme object
 */
function getPaperStyle(props: PopoverProps, theme: Theme) {
  const {
    anchorOrigin = DEFAULT_ANCHOR_ORIGIN,
    transformOrigin = DEFAULT_TRANSFORM_ORIGIN,
  } = props;

  const { horizontal: anchorH, vertical: anchorV } = anchorOrigin;
  const { horizontal: transformH, vertical: transformV } = transformOrigin;
  const spacing = theme.spacing(2);

  const cssProps: BaseCSSProperties = {};

  // The general method here is that if the anchor and the transform oppose one another in given
  // direction, then a margin will be applied away from the anchor
  if (areOpposed(anchorH, transformH)) {
    cssProps.marginLeft = anchorH === 'left' ? -spacing : spacing;
  }

  if (areOpposed(anchorV, transformV)) {
    cssProps.marginTop = anchorV === 'top' ? -spacing : spacing;
  }

  return cssProps;

  function areOpposed<T extends keyof PopoverOrigin>(
    originPropA: PopoverOrigin[T],
    originPropB: PopoverOrigin[T]
  ) {
    if (originPropA === 'left' && originPropB === 'right') return true;
    if (originPropB === 'left' && originPropA === 'right') return true;
    if (originPropA === 'bottom' && originPropB === 'top') return true;
    if (originPropB === 'bottom' && originPropA === 'top') return true;
    return false;
  }
}
