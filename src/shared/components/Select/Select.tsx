import * as React from 'react';
import isUndefined from 'lodash/isUndefined';
import noop from 'lodash/noop';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import MuiSelect from '@material-ui/core/Select';
import useTheme from '@material-ui/core/styles/useTheme';

import { makeStylesHook } from '@nav/shared/styles';
import { randomString } from '@nav/shared/util';


/** ============================ Types ===================================== */
type SelectProps<T> = {
  className?: string;
  id?: string;
  label?: string;
  onChange?: (value: T) => void;
  options: T[];
  renderOption?: ((option: T) => string) | keyof T;
  sorted?: boolean;
  value: T | undefined;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  formControl: {
    minWidth: 120
  },
  option: {
    fontWeight: theme.typography.fontWeightRegular
  },
  selectedOption: {
    fontWeight: theme.typography.fontWeightMedium
  }
}), 'NavigaderSelect');

/** ============================ Components ================================ */
export function Select <T>(props: SelectProps<T>) {
  const {
    id = randomString(),
    label,
    options,
    onChange = noop,
    renderOption = (option: T) => option,
    sorted = false,
    value,
    ...rest
  } = props;
  const theme = useTheme();
  const classes = useStyles(theme);
  
  let inputLabel: React.ReactNode = null;
  if (label) {
    inputLabel = <InputLabel id={id}>{label}</InputLabel>;
  }
  
  // If requested, sort the options by their rendering value
  const sortedOptions = sorted
    ? [...options].sort((option1, option2) => {
        const renderValue1 = getOptionRendering(option1);
        const renderValue2 = getOptionRendering(option2);
        
        if (renderValue1 < renderValue2) return -1;
        if (renderValue1 > renderValue2) return 1;
        return 0;
      })
    : options;
  
  const unselectedValue = '';
  const selectedValues = isUndefined(props.value)
    ? unselectedValue
    : sortedOptions.indexOf(props.value);
  
  const selectProps = {
    labelId: label ? id : undefined,
    onChange: handleChange,
    value: selectedValues,
    ...rest
  };
  
  return (
    <FormControl className={classes.formControl}>
      {inputLabel}
      <MuiSelect {...selectProps}>
        {sortedOptions.map((option, i) =>
          <MenuItem key={i} value={i} className={getStyles(option)}>
            {getOptionRendering(option)}
          </MenuItem>
        )}
      </MuiSelect>
    </FormControl>
  );
  
  /** ============================ Callbacks =============================== */
  function handleChange (event: React.ChangeEvent<{ name?: string; value: unknown; }>) {
    const index = +(event.target.value as string);
    onChange(sortedOptions[index]);
  }
  
  function getStyles (option: T) {
    const isSelected = Array.isArray(value)
      ? value.includes(option)
      : value === option;
    
    return isSelected
      ? classes.selectedOption
      : classes.option;
  }
  
  function getOptionRendering (option: T) {
    return typeof renderOption === 'function'
      ? renderOption(option)
      : option[renderOption];
  }
}
