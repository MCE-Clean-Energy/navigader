import React from 'react';
import omit from 'lodash/omit';
import { createStyles, makeStyles } from '@material-ui/core/styles';


/** ============================ Types ===================================== */
type PaddingProps = {
  pad?: number;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
};

/** ============================ Styles ==================================== */
const useStyles = makeStyles(
  createStyles({
    root: (props: PaddingProps) => {
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
  })
);

/** ============================ Components ================================ */
export const Padding: React.FC<PaddingProps> = (props) => {
  const childProps = omit(props, 'pad', 'top', 'left', 'bottom', 'right');
  return <div className={useStyles(props).root} {...childProps} />;
};
