import React, { ChangeEvent } from 'react';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';


/** ============================ Types ===================================== */
type NavigaderTextFieldProps = {
  autoComplete?: string;
  className?: string;
  color?: 'primary' | 'secondary';
  error?: boolean;
  helperText?: string | null;
  id: string;
  label?: string;
  name?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void,
  outlined?: boolean;
  type?: string;
}

/** ============================ Components ================================ */
const NavigaderTextField: React.FC<NavigaderTextFieldProps> = ({ outlined, ...rest }) => {
  const textFieldProps: TextFieldProps = {
    ...rest,
    variant: outlined ? 'outlined' : 'standard'
  };
  
  return <TextField {...textFieldProps} />;
};

NavigaderTextField.defaultProps = {
  color: 'primary',
  outlined: false
};

/** ============================ Exports =================================== */
export default NavigaderTextField;
