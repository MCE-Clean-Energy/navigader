import * as React from 'react';
import MuiRadio from '@material-ui/core/Radio';
import MuiRadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';


/** ============================ Types ===================================== */
type RadioProps = Omit<React.LabelHTMLAttributes<HTMLLabelElement>, 'onChange'> & {
  label: React.ReactNode;
  value: string;
};

type RadioGroupProps = {
  name?: string;
  value: string;
  onChange: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
};

/** ============================ Components ================================ */
const RadioGroup: React.FC<RadioGroupProps> = (props) => {
  return <MuiRadioGroup {...props} onChange={handleChange} />;

  /** ========================== Callbacks ================================= */
  /**
   * Simply flips the order of the arguments to the `onChange` callback, because I think this order
   * is easier to use
   *
   * @param {React.ChangeEvent} event: the React change event
   * @param {boolean} value: the value of the newly selected radio
   */
  function handleChange(event: React.ChangeEvent<HTMLInputElement>, value: string) {
    props.onChange(value, event);
  }
};

const RadioComponent: React.FC<RadioProps> = props =>
  <FormControlLabel control={<MuiRadio />} {...props} />;

export const Radio = Object.assign(RadioComponent, { Group: RadioGroup });
