import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';


/** ============================ Types ===================================== */
type NavigaderCheckboxProps = {
  checked?: boolean
};

/** ============================ Components ================================ */
const NavigaderCheckbox: React.FC<NavigaderCheckboxProps> = (props) => {
  return <Checkbox {...props} />;
};


/** ============================ Exports =================================== */
export default NavigaderCheckbox;
