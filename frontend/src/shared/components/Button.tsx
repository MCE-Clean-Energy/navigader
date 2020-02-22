import React, { ButtonHTMLAttributes } from 'react';
import MuiButton from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';


/** ============================ Types ===================================== */
type BaseButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
type ButtonProps = React.HTMLAttributes<HTMLButtonElement> & {
  color?: 'primary' | 'secondary';
  icon?: boolean;
} & Pick<BaseButtonProps, 'type'>

/** ============================ Components ================================ */
export const Button: React.FC<ButtonProps> = ({ icon, ...rest }) => {
  return icon
    ? <IconButton {...rest} />
    : <MuiButton variant="contained" {...rest} />;
};
