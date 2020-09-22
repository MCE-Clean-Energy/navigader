import * as React from 'react';
import MuiSnackbar from '@material-ui/core/Snackbar';

import { AlertType, Maybe } from 'navigader/types';
import { Alert } from './Alert';


/** ============================ Types ===================================== */
type SnackbarProps = {
  autoHideDuration?: number;
  children?: React.ReactElement<any, any>;
  onClose?: () => void;
  open: boolean;
};

type AlertSnackbarProps = SnackbarProps & {
  msg: Maybe<React.ReactNode>;
  type: Maybe<AlertType>;
};

/** ============================ Components ================================ */
export const Snackbar: React.FC<SnackbarProps> = (props) =>
  <MuiSnackbar {...props} />;

export const AlertSnackbar: React.FC<AlertSnackbarProps> = (props) => {
  const { msg, onClose, type, ...rest } = props;
  return (
    <Snackbar onClose={onClose} {...rest}>
      {msg && type ? <Alert onClose={onClose} type={type}>{msg}</Alert> : undefined}
    </Snackbar>
  );
};
