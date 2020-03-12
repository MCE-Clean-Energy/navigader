import * as React from 'react';
import identity from 'lodash/identity';
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
  renderOption?: ((option: T) => React.ReactNode) | keyof T;
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
}));

/** ============================ Components ================================ */
export function Select <T>(props: SelectProps<T>) {
  const {
    id = randomString(),
    label,
    multiple,
    options,
    onChange = noop,
    renderOption = identity,
    value,
    ...rest
  } = props;
  const theme = useTheme();
  const classes = useStyles(theme);
  
  let inputLabel: React.ReactNode = null;
  if (label) {
    inputLabel = <InputLabel id={id}>{label}</InputLabel>;
  }
  
  const unselectedValue = '';
  const selectedValues = props.multiple
    ? isUndefined(props.value) ? unselectedValue : props.value.map(v => options.indexOf(v))
    : isUndefined(props.value) ? unselectedValue : options.indexOf(props.value);
  
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
        {options.map((option, i) =>
          <MenuItem key={i} value={i} className={getStyles(option)}>
            {
              typeof renderOption === 'function'
                ? renderOption(option)
                : option[renderOption]
            }
          </MenuItem>
        )}
      </MuiSelect>
    </FormControl>
  );
  
  /** ============================ Callbacks =============================== */
  function handleChange (event: React.ChangeEvent<{ name?: string; value: unknown; }>) {
    const index = +(event.target.value as string);
    if (!props.multiple) {
      onChange(props.options[index]);
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
}
