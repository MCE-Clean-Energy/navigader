import * as React from 'react';
import MuiSnackbar from '@material-ui/core/Snackbar';


/** ============================ Types ===================================== */
type SnackbarProps = {
  autoHideDuration?: number;
  onClose?: () => void;
  open: boolean;
};

/** ============================ Components ================================ */
export const Snackbar: React.FC<SnackbarProps> = (props) =>
  <MuiSnackbar {...props} />;
