import * as React from 'react';
import MuiChip from '@material-ui/core/Chip';

import { makeStylesHook } from 'navigader/styles';
import { omitFalsey } from 'navigader/util';
import { Icon, ValidIcon } from './Icon';


/** ============================ Types ===================================== */
export type ChipProps = {
  color?: 'primary' | 'secondary' | 'default';
  disabled?: boolean;
  icon?: ValidIcon;
  label: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  /* Pseudo-class applied to the root element when the chip is disabled. This is required to
   * override MUI's default disabled-chip CSS, which sets `pointerEvents: "none"`; without pointer
   * events, it's impossible to render a tooltip.
   *
   * See https://material-ui.com/customization/components/#pseudo-classes
   */
  disabled: {},
  
  root: {
    boxShadow: theme.shadows[3],
    '&$disabled': {
      pointerEvents: 'auto',
    }
  },
}), 'MuiChip');

/** ============================ Components ================================ */
export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  (props, ref) => {
    const {
      color = 'default',
      disabled = false,
      icon,
      ...rest
    } = props;
    
    const classes = useStyles();
    const chipProps = omitFalsey({
      classes,
      color,
      disabled,
      icon: icon ? <Icon name={icon} /> : null,
      ref,
      ...rest
    });
    
    return <MuiChip {...chipProps} />;
  }
);
