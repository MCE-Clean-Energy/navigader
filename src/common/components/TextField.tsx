import classNames from 'classnames';
import _ from 'lodash';
import * as React from 'react';
import MuiInputAdornment from '@material-ui/core/InputAdornment';
import MuiTextField, { TextFieldProps as MuiTextFieldProps } from '@material-ui/core/TextField';

import { makeStylesHook } from 'navigader/styles';
import { Tuple } from 'navigader/types';
import { hooks, printWarning } from 'navigader/util';
import { Paper, PaperProps } from './Paper';

/** ============================ Types ===================================== */
type AdornmentProps = { position: 'start' | 'end' };
export type InputProps = {
  className?: string;
  endAdornment?: React.ReactNode;
  startAdornment?: React.ReactNode;
};

export type TextFieldProps = PaperProps & {
  autoComplete?: 'current-password' | 'new-password';
  autoFocus?: boolean;
  color?: 'primary' | 'secondary';
  error?: boolean;
  helperText?: string | null;
  hideNumberArrows?: boolean;
  id?: string;
  InputProps?: InputProps;
  label?: React.ReactNode;
  name?: string;
  numRows?: number | Tuple<number>;
  onChange?: (value: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  outlined?: boolean;
  placeholder?: string;
  tabIndex?: number;
  type?: string;
  value?: string;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(
  () => ({
    hideNumberArrows: {
      // Chrome, Safari, Edge, Opera
      '& input::-webkit-inner-spin-button, & input::-webkit-outer-spin-button': {
        '-webkit-appearance': 'none',
        'margin': 0,
      },

      // Firefox
      '& input[type=number]': {
        '-moz-appearance': 'textfield',
      },
    },
  }),
  'NavigaderTextField'
);

/** ============================ Components ================================ */
const Adornment: React.FC<AdornmentProps> = (props) => <MuiInputAdornment {...props} />;

export const TextField = Object.assign(
  React.forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => {
    const {
      autoComplete: autoCompleteProp,
      className,
      elevation = 0,
      hideNumberArrows,
      InputProps,
      numRows,
      onChange,
      outlined,
      ...rest
    } = props;
    const classes = useStyles();
    const paperClassName = classNames(className, {
      [classes.hideNumberArrows]: props.type === 'number' && hideNumberArrows,
    });

    const textFieldProps: MuiTextFieldProps = {
      ...rest,
      InputProps,
      onChange: (e) => onChange && onChange(e.target.value, e),
      variant: outlined ? 'outlined' : 'standard',
    };

    if (!_.isUndefined(numRows)) {
      textFieldProps.multiline = true;
      if (typeof numRows === 'number') {
        textFieldProps.rows = numRows;
      } else {
        const [rows, rowsMax] = numRows;
        Object.assign(textFieldProps, { rows, rowsMax });
        if (rows > rowsMax) {
          printWarning(
            `\`TextField\` component received invalid \`numRows\` prop: ${numRows}. The default 
            number of rows should not be greater than the maximum number of rows.`
          );
        }
      }
    }

    // Browsers have peculiar behavior when `autoComplete` is set to `off`. For example, Chrome will
    // ignore the "off" value and suggest values from its Address Book feature if it infers that
    // a field/form is for an address. By setting `autoComplete` to a random string, we defeat that
    // strange behavior by telling the browser to look for a value in its store with a key that's
    // ~20 random alphanumeric characters. Not finding such a key-value pair, it will not
    // autocomplete the field at all. Note that components can override this random string approach
    // by passing in their own `autoComplete` prop.
    const randomString = hooks.useRandomString();
    const autoComplete = autoCompleteProp || randomString;

    return (
      <Paper elevation={elevation} className={paperClassName}>
        <MuiTextField autoComplete={autoComplete} fullWidth inputRef={ref} {...textFieldProps} />
      </Paper>
    );
  }),
  {
    Adornment,
    displayName: 'NavigaderTextField',
    defaultProps: { color: 'primary', outlined: false },
  }
);
