import React, { ChangeEvent } from 'react';
import MuiTextField, { TextFieldProps as MuiTextFieldProps } from '@material-ui/core/TextField';


/** ============================ Types ===================================== */
type TextFieldProps = {
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
export const TextField: React.FC<TextFieldProps> = ({ outlined, ...rest }) => {
  const textFieldProps: MuiTextFieldProps = {
    ...rest,
    variant: outlined ? 'outlined' : 'standard'
  };
  
  return <MuiTextField {...textFieldProps} />;
};

TextField.defaultProps = {
  color: 'primary',
  outlined: false
};
