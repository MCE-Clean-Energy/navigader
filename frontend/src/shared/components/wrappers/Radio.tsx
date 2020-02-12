import React from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';


/** ============================ Types ===================================== */
type NavigaderRadioProps = Omit<React.LabelHTMLAttributes<HTMLLabelElement>, 'onChange'> & {
  label: React.ReactNode;
  value: string;
};

type NavigaderRadioGroupProps = {
  name?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>, value: string) => void;
};

type NavigaderRadioGroup = React.FC<NavigaderRadioGroupProps>;
type NavigaderRadioExport = React.FC<NavigaderRadioProps> & {
  Group: NavigaderRadioGroup;
};

/** ============================ Components ================================ */
const NavigaderRadio: NavigaderRadioExport =
    props => <FormControlLabel control={<Radio />} {...props} />;

const NavigaderRadioGroup: NavigaderRadioGroup = props => <RadioGroup {...props} />;

/** ============================ Exports =================================== */
NavigaderRadio.Group = NavigaderRadioGroup;
export default NavigaderRadio;
