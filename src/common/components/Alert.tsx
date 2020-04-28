import * as React from 'react';
import MuiAlert from '@material-ui/lab/Alert';
import MuiAlertTitle from '@material-ui/lab/AlertTitle';
import omit from 'lodash/omit';

import { makeStylesHook } from '@nav/common/styles';


/** ============================ Types ===================================== */
type AlertProps = {
  onClose?: () => void;
  outlined?: boolean;
  title?: React.ReactNode;
  type: 'error' | 'warning' | 'info' | 'success';
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook<AlertProps>(theme => ({
  alert: (props) => ({
    border: props.outlined
      ? `1px solid ${theme.palette[props.type].dark}`
      : 'none'
  })
}), 'NavigaderAlert');

/** ============================ Components ================================ */
export const Alert: React.FC<AlertProps> = (props) => {
  const { children, title, type, ...rest } = props;
  const classes = useStyles(props);
  const alertProps = {
    ...omit(rest, 'outlined'),
    className: classes.alert,
    severity: type
  };
  
  return (
    <MuiAlert {...alertProps}>
      {title && <MuiAlertTitle>{title}</MuiAlertTitle>}
      {children}
    </MuiAlert>
  );
};
