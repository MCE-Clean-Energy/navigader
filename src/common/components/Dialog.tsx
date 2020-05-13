import * as React from 'react';
import MuiDialog from '@material-ui/core/Dialog';
import MuiDialogActions from '@material-ui/core/DialogActions';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogContentText from '@material-ui/core/DialogContentText';
import MuiDialogTitle from '@material-ui/core/DialogTitle';


/** ============================ Types ===================================== */
type DialogProps = React.HTMLAttributes<HTMLDivElement> & {
  onClose: () => void;
  open: boolean;
}

type DialogActions = React.FC<React.HTMLAttributes<HTMLDivElement>>;
type DialogContent = React.FC<React.HTMLAttributes<HTMLDivElement> & { dividers?: boolean; }>;
type DialogContentText = React.FC;
type DialogTitle = React.FC<React.HTMLAttributes<HTMLDivElement>>;
type Dialog = React.FC<DialogProps>;
type DialogExport = Dialog & {
  Actions: DialogActions;
  Content: DialogContent;
  ContentText: DialogContentText;
  Title: DialogTitle;
};

/** ============================ Components ================================ */
const DialogComponent: Dialog = props => <MuiDialog {...props} />;
const DialogActions: DialogActions = props => <MuiDialogActions {...props} />;
const DialogContent: DialogContent = props => <MuiDialogContent {...props} />;
const DialogContentText: DialogContentText = props => <MuiDialogContentText {...props} />;
const DialogTitle: DialogTitle = props => <MuiDialogTitle {...props} />;

export const Dialog: DialogExport = Object.assign(
  DialogComponent, {
    Actions: DialogActions,
    Content: DialogContent,
    ContentText: DialogContentText,
    Title: DialogTitle
});
