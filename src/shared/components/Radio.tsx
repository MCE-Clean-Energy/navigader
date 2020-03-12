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
  onChange: (event: React.ChangeEvent<HTMLInputElement>, value: string) => void;
};

type RadioGroup = React.FC<RadioGroupProps>;
type RadioExport = React.FC<RadioProps> & {
  Group: RadioGroup;
};

/** ============================ Components ================================ */
export const Radio: RadioExport =
    props => <FormControlLabel control={<MuiRadio />} {...props} />;

const RadioGroup: RadioGroup = props => <MuiRadioGroup {...props} />;
Radio.Group = RadioGroup;
