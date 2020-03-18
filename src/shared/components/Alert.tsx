import * as React from 'react';
import MuiAlert from '@material-ui/lab/Alert';
import MuiAlertTitle from '@material-ui/lab/AlertTitle';


/** ============================ Types ===================================== */
type AlertProps = {
  onClose?: () => void;
  title?: React.ReactNode;
  type: 'error' | 'warning' | 'info' | 'success';
};

/** ============================ Components ================================ */
export const Alert: React.FC<AlertProps> = ({ children, title, type, ...rest }) => {
  return (
    <MuiAlert severity={type} {...rest}>
      {title && <MuiAlertTitle>{title}</MuiAlertTitle>}
      {children}
    </MuiAlert>
  );
};
