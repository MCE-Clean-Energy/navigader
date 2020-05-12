import * as React from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MuiSwitch from '@material-ui/core/Switch';


/** ============================ Types ===================================== */
type SwitchProps = {
  checked?: boolean;
  color?: 'primary' | 'secondary';
  label: React.ReactNode;
  name?: string;
  onChange: (checked: boolean, event: React.ChangeEvent) => void;
};

/** ============================ Components ================================ */
export const Switch: React.ComponentType<SwitchProps> = React.forwardRef(
  ({ checked, color, label, name, onChange }, ref) => {
    return (
      <FormControlLabel
        control={
          <MuiSwitch
            checked={checked}
            color={color}
            name={name}
            onChange={(event, checked) => onChange(checked, event)}
          />
        }
        label={label}
        ref={ref}
      />
    );
  }
);
