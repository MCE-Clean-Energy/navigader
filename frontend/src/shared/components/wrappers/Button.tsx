import React, { ButtonHTMLAttributes } from 'react';
import Button from '@material-ui/core/Button';


/** ============================ Types ===================================== */
type BaseButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
type NavigaderButtonProps = {
  color?: 'primary' | 'secondary';
} & Pick<BaseButtonProps, 'type'>

/** ============================ Components ================================ */
const NavigaderButton: React.FC<NavigaderButtonProps> = props =>
  <Button variant="contained" {...props} />;

/** ============================ Exports =================================== */
export default NavigaderButton;
