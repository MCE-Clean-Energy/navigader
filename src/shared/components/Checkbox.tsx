import React from 'react';
import MuiCheckbox from '@material-ui/core/Checkbox';


/** ============================ Types ===================================== */
type CheckboxProps = {
  checked?: boolean
};

/** ============================ Components ================================ */
export const Checkbox: React.FC<CheckboxProps> = (props) => {
  return <MuiCheckbox {...props} />;
};
