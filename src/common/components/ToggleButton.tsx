import * as React from 'react';
import MuiToggleButton from '@material-ui/lab/ToggleButton';
import MuiToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

/** ============================ Types ===================================== */
type ToggleButtonGroupProps = {
  deselectable?: boolean;
  exclusive?: boolean;
  onChange: (value: any) => void;
  size?: 'small' | 'medium' | 'large';
  value: any;
};

type ToggleButtonProps = {
  value: any;
};

/** ============================ Components ================================ */
const ToggleButtonGroup: React.ComponentType<ToggleButtonGroupProps> = React.forwardRef(
  ({ deselectable = false, exclusive = true, onChange, ...rest }, ref) => {
    return (
      <MuiToggleButtonGroup exclusive={exclusive} onChange={handleOnChange} ref={ref} {...rest} />
    );

    function handleOnChange(evt: React.MouseEvent, value: any) {
      if (!deselectable && value === null) return;
      onChange(value);
    }
  }
);

const ToggleButton: React.ComponentType<ToggleButtonProps> = React.forwardRef<
  HTMLButtonElement,
  ToggleButtonProps
>((props, ref) => <MuiToggleButton ref={ref} {...props} />);

ToggleButtonGroup.displayName = 'NavigaderToggleButtonGroup';
ToggleButton.displayName = 'NavigaderToggleButton';

export const Toggle = {
  Button: ToggleButton,
  Group: ToggleButtonGroup,
};
