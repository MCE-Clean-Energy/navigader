import * as React from 'react';
import MuiFormControl from '@material-ui/core/FormControl';
import MuiInputLabel from '@material-ui/core/InputLabel';
import MuiListSubheader from '@material-ui/core/ListSubheader';
import MuiMenuItem from '@material-ui/core/MenuItem';
import MuiSelect from '@material-ui/core/Select';
import useTheme from '@material-ui/core/styles/useTheme';

import { makeStylesHook } from 'navigader/styles';
import { Nullable } from 'navigader/types';
import { omitFalsey, printWarning, randomString } from 'navigader/util';
import _ from 'navigader/util/lodash';
import { Tooltip } from '../Tooltip';


/** ============================ Types ===================================== */
type OptionSection<T> = { title: Nullable<string>; options: T[]; };
type SelectProps<T> = {
  className?: string;
  id?: string;
  label?: string;
  onChange?: (value: T) => void;
  options?: T[];
  optionSections?: OptionSection<T>[];
  optionTooltip?: (option: T) => string | undefined;
  renderOption?: ((option: T) => string) | keyof T;
  sorted?: boolean;
  value: T | undefined;
};

type SectionOption<T> = {
  datum: T;
  index: number;
  text: string | T | T[keyof T];
  tooltip?: string;
};

type FormattedSection<T> = {
  title: Nullable<string>;
  options: Array<SectionOption<T>>
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(() => ({
  formControl: {
    minWidth: 120
  },
  menuItem: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  subheader: {
    cursor: 'default',
    pointerEvents: 'none'
  }
}), 'NavigaderSelect');

/** ============================ Components ================================ */
export function Select <T>(props: SelectProps<T>) {
  const {
    id = randomString(),
    label,
    onChange = () => {},
    options,
    optionSections,
    optionTooltip,
    renderOption = (option: T) => option,
    sorted = false,
    value,
    ...rest
  } = props;
  const theme = useTheme();
  const classes = useStyles(theme);
  
  let inputLabel: React.ReactNode = null;
  if (label) {
    inputLabel = <MuiInputLabel id={id}>{label}</MuiInputLabel>;
  }
  
  if (!options && !optionSections) printWarning(warnings.noOptions);
  if (options && optionSections) printWarning(warnings.tooManyOptions);
  
  const sections: OptionSection<T>[] = options
    ? [{ options, title: null }]
    : optionSections || [];
  
  // Format the sections
  let i = 0;
  const formattedSections: FormattedSection<T>[] = sections.map(section => ({
    title: section.title,
    options: section.options.map((option) => ({
      datum: option,
      index: i++,
      text: getOptionRendering(option),
      tooltip: getOptionTooltip(option)
    }))
  }));

  // If requested, sort the options by their text value
  i = 0;
  const sortedSections = sorted
    ? formattedSections.map(section => ({
        title: section.title,
        options: _.sortBy(section.options, 'text').map(option => ({ ...option, index: i++ }))
      }))
    : formattedSections;
  
  const sortedOptions = _.flatten(_.map(sortedSections, 'options'));
  const unselectedValue = '';
  const selectValue = _.isUndefined(value)
    ? unselectedValue
    : _.findIndex(sortedOptions, option => option.datum === value);

  return (
    <MuiFormControl className={classes.formControl}>
      {inputLabel}
      <MuiSelect
        labelId={label ? id : undefined}
        onChange={handleChange}
        value={selectValue}
        {...rest}
      >
        {_.flatten(sortedSections.map(section => omitFalsey([
          section.title && (
            <MuiListSubheader
              className={classes.subheader}
              key={`header-${section.title}`}
            >
              {section.title}
            </MuiListSubheader>
          ),
          section.options.map(option =>
            <MuiMenuItem key={option.index} value={option.index}>
              {option.tooltip
                ? (
                  <Tooltip placement="left" title={option.tooltip}>
                    <div>
                      <span className={classes.menuItem} />
                      {option.text}
                    </div>
                  </Tooltip>
                )
                : option.text
              }
            </MuiMenuItem>
          )
        ])))}
      </MuiSelect>
    </MuiFormControl>
  );
  
  /** ============================ Callbacks =============================== */
  function handleChange (event: React.ChangeEvent<{ name?: string; value: unknown; }>) {
    const index = +(event.target.value as string);
    onChange(sortedOptions[index].datum);
  }
  
  /** ============================ Helpers ================================= */
  function getOptionRendering (option: T) {
    return typeof renderOption === 'function'
      ? renderOption(option)
      : option[renderOption];
  }
  
  function getOptionTooltip (option: T) {
    return optionTooltip && optionTooltip(option);
  }
}

/** ============================ Helpers =================================== */
const warnings = {
  noOptions:
    '`Select` component did not receive `options` prop or `optionSections` prop. One of the two, ' +
    'but not both, is expected.',

  tooManyOptions:
    '`Select` component received `options` prop and `optionSections` prop. One of the two, but ' +
    'not both, is expected.'
};
