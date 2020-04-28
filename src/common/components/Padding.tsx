import * as React from 'react';
import omit from 'lodash/omit';
import classNames from 'classnames';

import { makeStylesHook } from '@nav/common/styles';


/** ============================ Types ===================================== */
type PaddingProps = {
  bottom?: number;
  className?: string;
  left?: number;
  pad?: number;
  right?: number;
  top?: number;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook<PaddingProps>(() => ({
  root: (props) => {
    if (typeof props.pad === 'number') {
      return {
        padding: props.pad
      };
    }
    
    return {
      paddingLeft: props.left,
      paddingRight: props.right,
      paddingTop: props.top,
      paddingBottom: props.bottom,
    };
  }
}), 'Padding');

/** ============================ Components ================================ */
export const Padding: React.FC<PaddingProps> = ({ className, ...rest }) => {
  const childProps = omit(rest, 'pad', 'top', 'left', 'bottom', 'right');
  const classes = classNames(
    useStyles(rest).root,
    className
  );
  
  return <div className={classes} {...childProps} />;
};
