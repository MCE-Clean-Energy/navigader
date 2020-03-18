import * as React from 'react';
import MuiTypography, { TypographyProps as MuiTypographyProps } from '@material-ui/core/Typography';
import classNames from 'classnames';

import { makeStylesHook } from '@nav/shared/styles';
import { printWarning } from '@nav/shared/util';


/** ============================ Types ===================================== */
type Emphasis = 'normal' | 'secondary' | 'disabled';
type TextColor =
  | 'initial'
  | 'primary'
  | 'secondary'
  | 'textPrimary'
  | 'textSecondary'
  | 'error';

export type TypographyProps = {
  className?: string;
  color?: TextColor;
  component?: React.ElementType;
  emphasis?: Emphasis;
  style?: React.CSSProperties;
  useDiv?: boolean;
  variant?: MuiTypographyProps['variant'];
};

/** ============================ Styles ==================================== */
const getOpacity = (emphasis?: Emphasis) => {
  switch (emphasis) {
    case 'secondary': return '60%';
    case 'disabled': return '38%';
    case 'normal':
    default: return '87%';
  }
};

const useStyles = makeStylesHook<TypographyProps>(() => ({
  text: props => ({
    opacity: getOpacity(props.emphasis)
  })
}));

/** ============================ Components ================================ */
export const Typography: React.FC<TypographyProps> = (props) => {
  const {
    children,
    className,
    color = 'initial',
    component = 'span',
    emphasis = 'normal',
    style,
    useDiv = false,
    variant = 'body1'
  } = props;
  const classes = useStyles({ emphasis });
  const spanClasses = classNames(className, classes.text);
  
  // If the component is provided both the `useDiv` and `component` props, we will print a warning
  // (when in development mode) and use a div.
  const actualComponent = useDiv ? 'div' : component;
  if (props.hasOwnProperty('component') && props.hasOwnProperty('useDiv')) {
    printWarning(
      '`Typography component` received both `useDiv` and `component` props. At most one prop' +
      ' should be provided'
    );
  }
  
  const typographyProps = {
    color,
    component: 'span',
    style,
    variant
  };
  
  return (
    <MuiTypography {...typographyProps}>
      {React.createElement(actualComponent, { className: spanClasses, children })}
    </MuiTypography>
  );
};
