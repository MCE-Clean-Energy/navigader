import React from 'react';
import { createUseStyles } from 'react-jss';
import omit from 'lodash/omit';
import classNames from 'classnames';

import { primaryColor, secondaryColor } from '../../styles';


/** ============================ Types ===================================== */
type GradientProps = {
  className?: string;
  finishPercent?: number;
  invert?: boolean;
  length?: number | string;
  orientation?: 'horizontal' | 'vertical';
  startPercent?: number;
};

const defaultProps: GradientProps = {
  finishPercent: 100,
  invert: false,
  orientation: 'vertical',
  startPercent: 0
};

/** ============================ Styles ==================================== */
// Styles are exported so they can be used as a mixin elsewhere
export const useGradientStyles = createUseStyles({
  // The props are default-initialized to `defaultProps` because, when used as a mixin elsewhere in
  // the application, the `Gradient` component's `defaultProps` attribute is not present
  root: (props: GradientProps = defaultProps) => {
    const startColor = props.invert ? secondaryColor : primaryColor;
    const endColor = props.invert ? primaryColor : secondaryColor;
    const lengthDimension = props.orientation === 'vertical' ? 'height' : 'width';
    const orientation = props.orientation === 'vertical' ? '0deg' : '90deg';
    return {
      backgroundColor: secondaryColor,
      background: `linear-gradient(
        ${orientation},
        ${startColor} ${props.startPercent}%,
        ${endColor} ${props.finishPercent}%
      )`,
      [lengthDimension]: props.length
    };
  }
});

/** ============================ Components ================================ */
export const Gradient: React.FC<GradientProps> = ({ className, ...rest }) => {
  const classes = useGradientStyles(rest);
  const childProps = omit(rest, 'finishPercent', 'invert', 'orientation', 'startPercent');
  return <div className={classNames(classes.root, className)} {...childProps} />;
};

Gradient.defaultProps = defaultProps;
