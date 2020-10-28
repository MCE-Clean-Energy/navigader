import * as React from 'react';
import MuiCheckbox from '@material-ui/core/Checkbox';

/** ============================ Types ===================================== */
type CheckboxProps = {
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
};

/** ============================ Components ================================ */
export const Checkbox: React.FC<CheckboxProps> = (props) => {
  return <MuiCheckbox {...props} onChange={handleChange} />;

  /** ========================== Callbacks ================================= */
  /**
   * Simply flips the order of the arguments to the `onChange` callback, because I think this order
   * is more useful
   *
   * @param {React.ChangeEvent} event: the React change event
   * @param {boolean} checked: whether the checkbox is now checked
   */
  function handleChange(event: React.ChangeEvent<HTMLInputElement>, checked: boolean) {
    if (typeof props.onChange === 'function') {
      props.onChange(checked, event);
    }
  }
};
