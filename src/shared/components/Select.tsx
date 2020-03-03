import React from 'react';
import { createUseStyles } from 'react-jss';
import identity from 'lodash/identity';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import MuiSelect from '@material-ui/core/Select';
import useTheme from '@material-ui/core/styles/useTheme';

import { Theme } from '@nav/shared/styles';
import { randomString } from '@nav/shared/util';


/** ============================ Types ===================================== */
type SelectCommonProps<T> = {
  id?: string;
  label?: string;
  options: T[];
  renderOption?: (option: T) => React.ReactNode;
};

type MultiSelectProps<T> = {
  multiple: true;
  onChange?: (value: T[]) => void;
  value?: T[];
}

type SingleSelectProps<T> = {
  multiple: false;
  onChange?: (value: T) => void;
  value?: T;
}

type SelectProps<T> = React.PropsWithChildren<
  SelectCommonProps<T> &
  (SingleSelectProps<T> | MultiSelectProps<T>)
>;

/** ============================ Styles ==================================== */
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const useStyles = createUseStyles((theme: Theme) => ({
  option: {
    fontWeight: theme.typography.fontWeightRegular
  },
  selectdOption: {
    fontWeight: theme.typography.fontWeightMedium
  }
}));

/** ============================ Components ================================ */
export function Select <T>(props: SelectProps<T>) {
  const {
    id = randomString(),
    label,
    options,
    onChange,
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
  
  const selectProps = {
    labelId: label ? id : undefined,
    MenuProps: MenuProps,
    onChange: handleChange,
    value,
    ...rest
  };
  
  return (
    <FormControl>
      {inputLabel}
      <MuiSelect {...selectProps}>
        {options.map((option, i) =>
          <MenuItem key={i} value={i} className={getStyles(option)}>
            {renderOption(option)}
          </MenuItem>
        )}
      </MuiSelect>
    </FormControl>
  );
  
  function handleChange (event: React.ChangeEvent<{ name?: string; value: unknown; }>) {
    if (onChange) {
      onChange(event.target.value as T & T[]);
    }
  }
  
  function getStyles (option: T) {
    const isSelected = Array.isArray(value)
      ? value.includes(option)
      : value === option;
    
    return isSelected
      ? classes.selectdOption
      : classes.option;
  }
}
