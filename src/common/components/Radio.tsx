import * as React from 'react';
import MuiFormControl from '@material-ui/core/FormControl';
import MuiFormControlLabel from '@material-ui/core/FormControlLabel';
import MuiFormLabel from '@material-ui/core/FormLabel';
import MuiRadio from '@material-ui/core/Radio';
import MuiRadioGroup from '@material-ui/core/RadioGroup';
import { Maybe } from 'navigader/types';

/** ============================ Types ===================================== */
type RadioProps = Omit<React.LabelHTMLAttributes<HTMLLabelElement>, 'onChange'> & {
  label: React.ReactNode;
  value: string;
};

type RadioGroupProps<T extends string> = React.PropsWithChildren<{
  className?: string;
  name?: string;
  label?: React.ReactNode;
  onChange: (value: T, event: React.ChangeEvent<HTMLInputElement>) => void;
  value: Maybe<T>;
}>;

/** ============================ Components ================================ */
function RadioGroup<T extends string>({ label, onChange, ...rest }: RadioGroupProps<T>) {
  return (
    <MuiFormControl component="fieldset">
      {label && <MuiFormLabel component="legend">{label}</MuiFormLabel>}
      <MuiRadioGroup {...rest} onChange={handleChange} />
    </MuiFormControl>
  );

  /** ========================== Callbacks ================================= */
  /**
   * Simply flips the order of the arguments to the `onChange` callback, because I think this order
   * is easier to use
   *
   * @param {React.ChangeEvent} event: the React change event
   * @param {boolean} value: the value of the newly selected radio
   */
  function handleChange(event: React.ChangeEvent<HTMLInputElement>, value: string) {
    onChange(value as T, event);
  }
}

const RadioComponent: React.FC<RadioProps> = (props) => (
  <MuiFormControlLabel control={<MuiRadio size="small" />} {...props} />
);

export const Radio = Object.assign(RadioComponent, { Group: RadioGroup });
