import React from 'react';
import { createUseStyles } from 'react-jss';
import omit from 'lodash/omit';
import classNames from 'classnames';

import { primaryColor, secondaryColor } from '../../styles';


/** ============================ Types ===================================== */
type GradientProps = {
  className?: string;
  finishPercent?: number;
  height?: number | string;
  invert?: boolean;
};

const defaultProps = {
  finishPercent: 100,
  invert: false
};

/** ============================ Styles ==================================== */
// Styles are exported so they can be used as a mixin elsewhere
export const useGradientStyles = createUseStyles({
  root: (props: GradientProps = defaultProps) => {
    const startColor = props.invert ? secondaryColor : primaryColor;
    const endColor = props.invert ? primaryColor : secondaryColor;
    return {
      backgroundColor: secondaryColor,
      background: `linear-gradient(0, ${startColor} 0%, ${endColor} ${props.finishPercent}%)`,
      height: props.height
    };
  }
});

/** ============================ Components ================================ */
export const Gradient: React.FC<GradientProps> = ({ className, ...rest }) => {
  const classes = useGradientStyles(rest);
  const childProps = omit(rest, 'finishPercent', 'invert');
  return <div className={classNames(classes.root, className)} {...childProps} />;
};

Gradient.defaultProps = defaultProps;
