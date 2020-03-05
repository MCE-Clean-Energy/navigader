import React from 'react';
import MuiPopover from '@material-ui/core/Popover';

import { Theme, useTheme } from '@nav/shared/styles';


/** ============================ Types ===================================== */
type PopoverOrigin = {
  vertical: 'top' | 'center' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
};

type PopoverProps = {
  anchorEl?: null | Element;
  anchorOrigin?: PopoverOrigin;
  className?: string;
  id?: string;
  onClose?: () => void;
  open: boolean;
  transformOrigin?: PopoverOrigin;
};

/** ============================ Components ================================ */
export const Popover: React.FC<PopoverProps> = (props) => {
  const theme = useTheme();
  const {
    anchorOrigin = { vertical: 'bottom', horizontal: 'center' } as PopoverOrigin,
    transformOrigin = { vertical: 'top', horizontal: 'center' } as PopoverOrigin,
    ...rest
  } = props;
  
  return (
    <MuiPopover
      {...rest}
      anchorOrigin={anchorOrigin}
      PaperProps={{
        style: getPaperTransform(anchorOrigin, theme)
      }}
      transformOrigin={transformOrigin}
    />
  );
};

/** ============================ Helpers =================================== */
/**
 * Returns the CSS transform that will be applied to the `Popover`'s `Paper` element. The objective
 * is to provide some spacing between the anchor and the Paper. For example, If the Paper is
 * meant to render to the left of the anchor, then we will move it to the left with a
 * `transformX` property, if it is meant to render below the anchor, we will move it down with a
 * `transformY` property, and if it is meant to render above and to the right of the anchor, we
 * will move it right and up with a combined `translate` property.
 *
 * @param {PopoverOrigin} anchorOrigin: the argument describing the relative positioning between the
 *   anchor and the  Paper element
 * @param {Theme} theme: the theme object
 */
function getPaperTransform (anchorOrigin: PopoverOrigin, theme: Theme): React.CSSProperties {
  const { horizontal, vertical } = anchorOrigin;
  const spacing = theme.spacing(2);
  
  const xTranslation = horizontal === 'left'
    ? '-' + spacing
    : horizontal === 'center'
      ? 0
      : spacing;
  
  const yTranslation = vertical === 'top'
    ? '-' + spacing
    : vertical === 'center'
      ? 0
      : spacing;
  
  return {
    transform: `translate(${xTranslation}px, ${yTranslation}px)`
  };
}
