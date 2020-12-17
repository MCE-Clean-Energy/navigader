import * as React from 'react';
import MuiDialog from '@material-ui/core/Dialog';
import MuiDialogActions from '@material-ui/core/DialogActions';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogContentText from '@material-ui/core/DialogContentText';
import MuiDialogTitle from '@material-ui/core/DialogTitle';

import { Button } from './Button';

/** ============================ Types ===================================== */
type DialogProps = React.HTMLAttributes<HTMLDivElement> & {
  fullWidth?: boolean;
  onClose: () => void;
  open: boolean;
};

type DeleteDialogProps = DialogProps & {
  onClickDelete: () => void;
  title: string;
  message: string;
};

type DialogActionsProps = React.HTMLAttributes<HTMLDivElement>;
type DialogContentProps = React.HTMLAttributes<HTMLDivElement> & { dividers?: boolean };
type DialogTitleProps = React.HTMLAttributes<HTMLDivElement>;

/** ============================ Components ================================ */
const DialogComponent: React.FC<DialogProps> = (props) => <MuiDialog {...props} />;
const DialogActions: React.FC<DialogActionsProps> = (props) => <MuiDialogActions {...props} />;
const DialogContent: React.FC<DialogContentProps> = (props) => <MuiDialogContent {...props} />;
const DialogContentText: React.FC = (props) => <MuiDialogContentText {...props} />;
const DialogTitle: React.FC<DialogTitleProps> = (props) => <MuiDialogTitle {...props} />;

const DeleteDialog: React.FC<DeleteDialogProps> = (props) => {
  const { onClose, onClickDelete, title, message, open } = props;
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="delete-dialog-title">
      <Dialog.Title id="delete-dialog-title">{title}</Dialog.Title>
      <Dialog.Content>
        <Dialog.ContentText>{message}</Dialog.ContentText>
      </Dialog.Content>
      <Dialog.Actions>
        <Button.Text onClick={onClose}>Cancel</Button.Text>
        <Button.Text
          color="primary"
          onClick={() => {
            onClose();
            onClickDelete();
          }}
        >
          Delete
        </Button.Text>
      </Dialog.Actions>
    </Dialog>
  );
};

export const Dialog = Object.assign(DialogComponent, {
  Actions: DialogActions,
  Content: DialogContent,
  ContentText: DialogContentText,
  Delete: DeleteDialog,
  Title: DialogTitle,
});
