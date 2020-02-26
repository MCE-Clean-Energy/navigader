import React from 'react';
import { createUseStyles } from 'react-jss';
import MuiTypography, { TypographyProps as MuiTypographyProps } from '@material-ui/core/Typography';
import classNames from 'classnames';



/** ============================ Types ===================================== */
type Emphasis = 'normal' | 'secondary' | 'disabled';
type TypographyProps = {
  className?: string;
  component?: React.ElementType;
  emphasis?: Emphasis;
  style?: React.CSSProperties;
  useDiv?: boolean;
  variant: MuiTypographyProps['variant'];
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

const useStyles = createUseStyles({
  text: (emphasis: Emphasis) => ({
    opacity: getOpacity(emphasis)
  })
});

/** ============================ Components ================================ */
export const Typography: React.FC<TypographyProps> = (props) => {
  const {
    children,
    className,
    component = 'span',
    emphasis = 'normal',
    style,
    useDiv = false,
    variant
  } = props;
  const classes = useStyles(emphasis);
  const spanClasses = classNames(className, classes.text);
  
  // If the component is provided both the `useDiv` and `component` props, we will print a warning
  // (when in development mode) and use a div.
  const actualComponent = useDiv ? 'div' : component;
  if (props.hasOwnProperty('component') && props.hasOwnProperty('useDiv')) {
    console.warn(
      '`Typography component` received both `useDiv` and `component` props. At most one prop' +
      ' should be provided'
    );
  }
  
  return (
    <MuiTypography style={style} variant={variant} component="span">
      {React.createElement(actualComponent, { className: spanClasses, children })}
    </MuiTypography>
  );
};
