import * as React from "react";
import { Button, Dialog } from "navigader/components";

/** ============================ Types ===================================== */
type DeleteDialogProps = {
  onClose: () => void;
  onClickDelete: () => void;
  title: string;
  message: string;
  open: boolean;
};

/** ============================ Components ================================ */
export const DeleteDialog: React.FC<DeleteDialogProps> = (props) => {
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
