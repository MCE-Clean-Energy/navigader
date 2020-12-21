import * as React from 'react';
import { useDispatch } from 'react-redux';

import * as api from 'navigader/api';
import { Button, Dialog } from 'navigader/components';
import { slices } from 'navigader/store';
import { OriginFile } from 'navigader/types';

/** ============================ Types ===================================== */
type DeleteDialogProps = {
  onClose: () => void;
  originFile: OriginFile;
};

/** ============================ Components ================================ */
export const DeleteDialog: React.FC<DeleteDialogProps> = (props) => {
  const { onClose, originFile } = props;
  const dispatch = useDispatch();

  return (
    <Dialog open onClose={onClose} aria-labelledby="delete-dialog-title">
      <Dialog.Title id="delete-dialog-title">Delete Upload?</Dialog.Title>
      <Dialog.Content>
        <Dialog.ContentText>
          This will permanently delete the uploaded file. This action can't be undone.
        </Dialog.ContentText>
      </Dialog.Content>
      <Dialog.Actions>
        <Button.Text onClick={onClose}>Cancel</Button.Text>
        <Button.Text color="primary" onClick={deleteOriginFile}>
          Delete
        </Button.Text>
      </Dialog.Actions>
    </Dialog>
  );

  /** ========================== Callbacks ================================= */
  async function deleteOriginFile() {
    onClose();

    // Optimistically delete the originFile. This will be reverted if the request fails.
    dispatch(slices.models.removeModel(originFile));

    // Make the DELETE request and set a success or failure message
    const response = await api.deleteMeterGroup(originFile.id);
    if (response.ok) {
      dispatch(slices.ui.setMessage({ msg: 'Upload deleted.', type: 'success' }));
    } else {
      // Undo optimistic update
      dispatch(slices.models.updateModel(originFile));
      dispatch(slices.ui.setMessage({ msg: 'Delete failed! Please try again.', type: 'error' }));
    }
  }
};
