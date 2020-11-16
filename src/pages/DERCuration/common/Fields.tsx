import _ from 'lodash';
import * as React from 'react';

import {
  Alert,
  Grid,
  InfoIcon,
  InputProps,
  Radio,
  TextField as NavigaderTextField,
  TextFieldProps as NavigaderTextFieldProps,
} from 'navigader/components';
import { Maybe, Tuple } from 'navigader/types';
import { printWarning } from 'navigader/util';

import { DialogContext, DialogState, parseNumberStr, serializeNumber } from './util';

/** ============================ Constants ================================= */
const MAX_DER_STRATEGY_NAME = 128;

/** ============================ Types ===================================== */
type RangeBoundary = { inclusive: boolean; value: number };
type LabelProp = string | { text: string; units: string };
type FieldProps = { field: string; label: LabelProp };

interface RangeFieldProps extends FieldProps {
  extraValidations?: (value: number) => Maybe<string>;
  infoText?: React.ReactNode;
  InputProps?: InputProps;
  range: string;
}

interface TextFieldProps extends FieldProps, Pick<NavigaderTextFieldProps, 'numRows'> {
  required?: boolean;
  maxLength?: number;
}

interface BooleanFieldProps extends FieldProps {
  extraStateChanges?: (value: boolean) => Maybe<object>;
  infoText?: string;
  options: { n: string; y: string };
}

/** ============================ Numeric Fields ============================ */
/**
 * Validates that input falls within a given range
 */
export const RangeField: React.FC<RangeFieldProps> = (props) => {
  const { extraValidations = () => undefined, field, infoText, InputProps, label, range } = props;
  const { setState, state } = React.useContext(DialogContext);
  const value = state[field] as Maybe<number>;
  const error = state.errors[field];
  const [min, max] = React.useMemo(parseRange, [range]);

  return (
    <NavigaderTextField
      error={Boolean(error)}
      helperText={error}
      hideNumberArrows
      InputProps={InputProps}
      label={getLabel(label, infoText)}
      onChange={handleChange}
      type="number"
      value={serializeNumber(value)}
    />
  );

  /** ========================== Callbacks ================================= */
  function handleChange(valueStr: string) {
    const value = parseNumberStr(valueStr);
    setState({
      [field]: value,
      errors: { ...state.errors, [field]: validate(value) },
    });
  }

  /** ========================== Helpers =================================== */
  function validate(value: Maybe<number>): string | undefined {
    const labelBase = getLabelBase(label);
    if (_.isUndefined(value)) return `${labelBase} may not be blank`;
    if (min.inclusive && value < min.value)
      return `${labelBase} must be greater than or equal to ${min.value}`;
    if (!min.inclusive && value <= min.value)
      return `${labelBase} must be greater than ${min.value}`;
    if (max.inclusive && value > max.value)
      return `${labelBase} must be less than or equal to ${max.value}`;
    if (!max.inclusive && value >= max.value) return `${labelBase} must be less than ${max.value}`;
    return extraValidations(value);
  }

  /**
   * Parses the `range` prop. The range should be provided in mathematical interval notation, in
   * which two numbers are bracketed on the left by either `(` or `[` and on the right by either
   * `)` or `]`. A parenthesis means the interval does not include the interval's endpoint, while a
   * bracket means the interval does include its endpoint:
   *
   *   (0, 100): range spans 0-100, excluding both endpoints
   *   (0, 100]: range spans 0-100, including 100 but excluding 0
   *   [0, 100): range spans 0-100, including 0 but excluding 100
   *   [0, 100]: range spans 0-100, including both endpoints.
   *
   * If parsing fails and the provided prop is invalid, this will print a warning and return the
   * range -Infinity to Infinity.
   */
  function parseRange(): Tuple<RangeBoundary> {
    const match = range.match(/^([(|[])([^,]*),\s*([^,]*)([)|\]])$/);
    if (!match) {
      printWarning(`\`RangeField\` component received invalid \`range\` prop: ${range}`);
      return [
        { value: -Infinity, inclusive: false },
        { value: Infinity, inclusive: false },
      ];
    }

    // Grab the groups
    const [lBracket, minValue, maxValue, rBracket] = match.slice(1, 5);

    // Validate that the lower and upper bounds both parse to numbers. This can handle Infinity as
    // well as scientific notation
    let [parsedMin, parsedMax] = [parseFloat(minValue), parseFloat(maxValue)];
    if (isNaN(parsedMin)) {
      printWarning(`\`RangeField\` component received invalid lower bound: ${minValue}`);
      parsedMin = -Infinity;
    }
    if (isNaN(parsedMax)) {
      printWarning(`\`RangeField\` component received invalid upper bound: ${maxValue}`);
      parsedMax = Infinity;
    }

    return [
      { value: parsedMin, inclusive: lBracket === '[' },
      { value: parsedMax, inclusive: rBracket === ']' },
    ];
  }
};

/**
 * Formats an input as a percentage by adorning the text field with a % sign
 */
export const PercentageField: React.FC<RangeFieldProps> = (props) => (
  <RangeField
    {...props}
    InputProps={{
      endAdornment: <NavigaderTextField.Adornment position="end">%</NavigaderTextField.Adornment>,
    }}
  />
);

/**
 * Validates that input value is an integer
 */
export const IntegerField: React.FC<RangeFieldProps> = (props) => (
  <RangeField
    {...props}
    extraValidations={(value) => {
      if (Math.floor(value) !== value) return `${props.label} must be an integer`;
    }}
  />
);

/** ============================ Text Fields =============================== */
/**
 * Provides optional string validations, including a nullability check and a length check
 */
export const TextField: React.FC<TextFieldProps> = (props) => {
  const { field, label, maxLength, numRows, required } = props;
  const { setState, state } = React.useContext(DialogContext);
  const value = state[field] as Maybe<string>;
  const error = state.errors[field];

  return (
    <NavigaderTextField
      error={Boolean(error)}
      helperText={error}
      label={getLabel(label)}
      numRows={numRows}
      onChange={handleChange}
      value={value || ''}
    />
  );

  /** ========================== Callbacks ================================= */
  function handleChange(valueStr: string) {
    const value = valueStr === '' ? undefined : valueStr;
    setState({
      [field]: value,
      errors: { ...state.errors, [field]: validate(value) },
    } as Partial<DialogState<any>>);
  }

  /** ========================== Helpers =================================== */
  function validate(value: Maybe<string>) {
    const labelBase = getLabelBase(label);
    if (required && (_.isUndefined(value) || value.length === 0))
      return `${labelBase} may not be blank`;
    if (maxLength && value && value.length > maxLength)
      return `${labelBase} too long. Max length is ${maxLength} (currently ${value.length})`;
  }
};

/**
 * Specific reusable `TextField` component to handle a strategy's description
 */
export const DescriptionField: React.FC = () => (
  <TextField field="description" label="Description" numRows={[3, 10]} />
);

/**
 * Specific reusable `TextField` component to handle a strategy/configuration's name
 */
export const NameField: React.FC = () => (
  <TextField field="name" label="Name" maxLength={MAX_DER_STRATEGY_NAME} required />
);

/** ============================ Other fields ============================== */
export const BooleanField: React.FC<BooleanFieldProps> = (props) => {
  const { extraStateChanges = () => {}, field, infoText, label, options } = props;
  const { setState, state } = React.useContext(DialogContext);
  const value = state[field] ? 'y' : 'n';

  return (
    <Radio.Group
      label={
        <>
          <span>{label}</span>
          {infoText && <InfoIcon text={infoText} />}
        </>
      }
      onChange={handleChange}
      value={value}
    >
      <Radio label={options.y} value="y" />
      <Radio label={options.n} value="n" />
    </Radio.Group>
  );

  /** ========================== Callbacks ================================= */
  function handleChange(valueStr: string) {
    const value = valueStr === 'y';
    setState({
      [field]: value,
      ...extraStateChanges(value),
    });
  }
};

/** ============================ Errors ==================================== */
export const NonFieldError: React.FC = () => {
  const { state } = React.useContext(DialogContext);
  const { errors } = state;
  const nonFieldError = errors.__all__;
  return nonFieldError ? (
    <Grid.Item span={12}>
      <Alert type="error">{nonFieldError}</Alert>
    </Grid.Item>
  ) : null;
};

/** ============================ Helpers =================================== */
function getLabel(label: LabelProp, infoText?: React.ReactNode) {
  const labelStr = _.isString(label) ? label : `${label.text} (${label.units})`;
  if (infoText) {
    return (
      <>
        <span>{labelStr}</span>
        <InfoIcon text={infoText} />
      </>
    );
  }

  return labelStr;
}

function getLabelBase(label: LabelProp) {
  return _.isString(label) ? label : label.text;
}
