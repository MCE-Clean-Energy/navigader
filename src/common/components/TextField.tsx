import * as React from 'react';
import MuiTextField, { TextFieldProps as MuiTextFieldProps } from '@material-ui/core/TextField';

import { Paper, PaperProps } from './Paper';


/** ============================ Types ===================================== */
type TextFieldProps = PaperProps & {
  autoComplete?: string;
  autoFocus?: boolean;
  color?: 'primary' | 'secondary';
  error?: boolean;
  helperText?: string | null;
  id: string;
  label?: string;
  name?: string;
  onChange?: (value: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
  outlined?: boolean;
  tabIndex?: number;
  type?: string;
  value?: string;
}

/** ============================ Components ================================ */
export const TextField: React.FC<TextFieldProps> = (props) => {
  const { className, elevation = 0, onChange, outlined, ...rest } = props;
  const textFieldProps: MuiTextFieldProps = {
    ...rest,
    onChange: e => onChange && onChange(e.target.value, e),
    variant: outlined ? 'outlined' : 'standard'
  };
  
  return (
    <Paper elevation={elevation} className={className}>
      <MuiTextField autoComplete="off" {...textFieldProps} fullWidth />
    </Paper>
  );
};

TextField.defaultProps = {
  color: 'primary',
  outlined: false
};
