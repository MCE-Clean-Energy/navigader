import * as React from 'react';
import MuiChip from '@material-ui/core/Chip';

import { makeStylesHook } from '@nav/shared/styles';
import { omitFalsey } from '@nav/shared/util';
import { Icon, ValidIcon } from './Icon';


/** ============================ Types ===================================== */
export type ChipProps = {
  color?: 'primary' | 'secondary' | 'default';
  disabled?: boolean;
  icon?: ValidIcon;
  label: string;
  onClick?: () => void;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  chip: {
    boxShadow: theme.shadows[3]
  }
}), 'NavigaderChip');

/** ============================ Components ================================ */
export const Chip: React.FC<ChipProps> = (props) => {
  const {
    color = 'default',
    disabled = false,
    icon,
    ...rest
  } = props;
  
  const classes = useStyles();
  const chipProps = omitFalsey({
    className: classes.chip,
    color,
    disabled,
    icon: icon ? <Icon name={icon} /> : null,
    ...rest
  });
  
  return (
    <MuiChip {...chipProps} />
  );
};
