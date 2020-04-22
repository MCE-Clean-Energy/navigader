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
type SelectCommonProps<T> = {
  className?: string;
  id?: string;
  label?: string;
  options: T[];
  renderOption?: ((option: T) => string) | keyof T;
  sorted?: boolean;
};

type MultiSelectProps<T> = {
  multiple: true;
  onChange?: (value: T[]) => void;
  value: T[] | undefined;
}

type SingleSelectProps<T> = {
  multiple?: false;
  onChange?: (value: T) => void;
  value: T | undefined;
}

type SelectProps<T> = React.PropsWithChildren<
  SelectCommonProps<T> &
  (SingleSelectProps<T> | MultiSelectProps<T>)
>;

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
    multiple,
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
  const selectedValues = props.multiple
    ? isUndefined(props.value) ? unselectedValue : props.value.map(v => sortedOptions.indexOf(v))
    : isUndefined(props.value) ? unselectedValue : sortedOptions.indexOf(props.value);
  
  const selectProps = {
    labelId: label ? id : undefined,
    multiple,
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
    if (!props.multiple) {
      onChange(sortedOptions[index]);
    } else {
      // TODO: support multi-select
    }
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
