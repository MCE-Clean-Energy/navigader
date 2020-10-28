import * as React from 'react';
import MuiTextField, { TextFieldProps as MuiTextFieldProps } from '@material-ui/core/TextField';

import { makeStylesHook } from 'navigader/styles';
import { Paper, PaperProps } from './Paper';

/** ============================ Types ===================================== */
type TextFieldProps = PaperProps & {
  autoComplete?: string;
  autoFocus?: boolean;
  color?: 'primary' | 'secondary';
  error?: boolean;
  helperText?: string | null;
  id?: string;
  label?: string;
  name?: string;
  onChange?: (value: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  outlined?: boolean;
  placeholder?: string;
  tabIndex?: number;
  type?: string;
  value?: string;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(
  (theme) => ({
    notchedOutline: {
      '& > legend': {
        // This is required when overriding the default `fontSize` theme variable. The parameters
        // are as such:
        //   - 16: body1's relative sizing. Body1 is the typography class applied by the `FormLabel`
        //         component
        //   - 0.75: the amount that the `InputLabel` component scales the label when it's
        //           "shrunk" and the input variant is "outlined"
        fontSize: theme.typography.pxToRem(16 * 0.75),
      },
    },
  }),
  'NavigaderTextField'
);

/** ============================ Components ================================ */
export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => {
  const { className, elevation = 0, onChange, outlined, ...rest } = props;
  const classes = useStyles();
  const textFieldProps: MuiTextFieldProps = {
    ...rest,
    onChange: (e) => onChange && onChange(e.target.value, e),
    variant: outlined ? 'outlined' : 'standard',
  };

  if (outlined) {
    textFieldProps.InputProps = { classes };
  }

  return (
    <Paper elevation={elevation} className={className}>
      <MuiTextField autoComplete="off" fullWidth inputRef={ref} {...textFieldProps} />
    </Paper>
  );
});

TextField.defaultProps = {
  color: 'primary',
  outlined: false,
};
