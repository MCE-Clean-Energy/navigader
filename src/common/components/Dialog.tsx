import * as React from 'react';
import MuiDialog from '@material-ui/core/Dialog';
import MuiDialogActions from '@material-ui/core/DialogActions';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogContentText from '@material-ui/core/DialogContentText';
import MuiDialogTitle from '@material-ui/core/DialogTitle';


/** ============================ Types ===================================== */
type DialogProps = React.HTMLAttributes<HTMLDivElement> & {
  fullWidth?: boolean;
  onClose: () => void;
  open: boolean;
}

type DialogActionsProps = React.HTMLAttributes<HTMLDivElement>;
type DialogContentProps = React.HTMLAttributes<HTMLDivElement> & { dividers?: boolean; };
type DialogTitleProps = React.HTMLAttributes<HTMLDivElement>;

/** ============================ Components ================================ */
const DialogComponent: React.FC<DialogProps> = props => <MuiDialog {...props} />;
const DialogActions: React.FC<DialogActionsProps> = props => <MuiDialogActions {...props} />;
const DialogContent: React.FC<DialogContentProps> = props => <MuiDialogContent {...props} />;
const DialogContentText: React.FC = props => <MuiDialogContentText {...props} />;
const DialogTitle: React.FC<DialogTitleProps> = props => <MuiDialogTitle {...props} />;

export const Dialog = Object.assign(
  DialogComponent, {
    Actions: DialogActions,
    Content: DialogContent,
    ContentText: DialogContentText,
    Title: DialogTitle
});
