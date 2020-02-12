import React, { ButtonHTMLAttributes } from 'react';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';


/** ============================ Types ===================================== */
type BaseButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
type NavigaderButtonProps = React.HTMLAttributes<HTMLButtonElement> & {
  color?: 'primary' | 'secondary';
  icon?: boolean;
} & Pick<BaseButtonProps, 'type'>

/** ============================ Components ================================ */
const NavigaderButton: React.FC<NavigaderButtonProps> = ({ icon, ...rest }) => {
  return icon
    ? <IconButton {...rest} />
    : <Button variant="contained" {...rest} />;
};


/** ============================ Exports =================================== */
export default NavigaderButton;
