import * as React from 'react';
import MuiTypography, { TypographyProps as MuiTypographyProps } from '@material-ui/core/Typography';
import classNames from 'classnames';

import { makeStylesHook } from '@nav/common/styles';
import { printWarning } from '@nav/common/util';


/** ============================ Types ===================================== */
type Emphasis = 'bold' | 'disabled' | 'normal' | 'secondary';
type TextColor =
  | 'inherit'
  | 'initial'
  | 'primary'
  | 'secondary'
  | 'textPrimary'
  | 'textSecondary'
  | 'error'
  | 'warning'
  | 'info'
  | 'success';

export type TypographyProps = React.HTMLAttributes<HTMLSpanElement> & {
  className?: string;
  color?: TextColor;
  component?: React.ElementType;
  emphasis?: Emphasis;
  style?: React.CSSProperties;
  useDiv?: boolean;
  variant?: MuiTypographyProps['variant'];
};

/** ============================ Styles ==================================== */
function getOpacity (emphasis?: Emphasis) {
  switch (emphasis) {
    case 'secondary': return '60%';
    case 'disabled': return '38%';
    case 'normal':
    default: return '87%';
  }
}

function getFontWeight (emphasis?: Emphasis) {
  if (emphasis === 'bold') return 'bold';
  return 'inherit';
}

const useStyles = makeStylesHook<TypographyProps>(theme => ({
  text: props => ({
    opacity: getOpacity(props.emphasis),
    fontWeight: getFontWeight(props.emphasis)
  }),
  info: {
    color: theme.palette.info.main
  },
  success: {
    color: theme.palette.success.main
  },
  warning: {
    color: theme.palette.warning.main
  }
}), 'NavigaderTypography');

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
    variant = 'body1',
    ...rest
  } = props;
  const classes = useStyles({ emphasis });
  const spanClasses = classNames(className, classes.text, {
    [classes.info]: color === 'info',
    [classes.success]: color === 'success',
    [classes.warning]: color === 'warning'
  });

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
    color: getColor(color),
    component: 'span',
    style,
    variant,
    ...rest
  };

  return (
    <MuiTypography {...typographyProps}>
      {React.createElement(actualComponent, { className: spanClasses, children })}
    </MuiTypography>
  );
};

/** ============================ Helpers =================================== */
export function getColor (color?: TextColor): MuiTypographyProps['color'] {
  switch (color) {
    case 'info':
    case 'success':
    case 'warning':
      return undefined;
    default: return color;
  }
}
