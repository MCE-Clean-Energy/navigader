import React, { ButtonHTMLAttributes } from 'react';
import omit from 'lodash/omit';
import MuiButton from '@material-ui/core/Button';
import MuiFab from '@material-ui/core/Fab';
import MuiIconButton from '@material-ui/core/IconButton';

import { Icon, IconProps } from './Icon';


/** ============================ Types ===================================== */
type BaseButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
type ButtonProps = React.HTMLAttributes<HTMLButtonElement> & {
  color?: 'primary' | 'secondary';
  icon?: boolean;
} & Pick<BaseButtonProps, 'type'>;

type FabProps = Omit<ButtonProps, 'type'> & IconProps;
type Button = React.FC<ButtonProps> & {
  Fab: React.FC<FabProps>
};

/** ============================ Components ================================ */
export const Button: Button = ({ icon, ...rest }) => {
  return icon
    ? <MuiIconButton {...rest} />
    : <MuiButton variant="contained" {...rest} />;
};

Button.Fab = ({ name, ...rest }) => {
  const fabProps = omit(rest, 'children');
  const iconProps = { name };
  return (
      <MuiFab {...fabProps}>
        <Icon {...iconProps} />
      </MuiFab>
    );
};
