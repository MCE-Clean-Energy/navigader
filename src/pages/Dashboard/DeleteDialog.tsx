import * as React from 'react';
import { useDispatch } from 'react-redux';

import * as api from 'navigader/api';
import { Button, Dialog } from 'navigader/components';
import { slices } from 'navigader/store';
import { Scenario } from 'navigader/types';


/** ============================ Types ===================================== */
type DeleteDialogProps = {
  onClose: () => void;
  scenario: Scenario;
};

/** ============================ Components ================================ */
export const DeleteDialog: React.FC<DeleteDialogProps> = (props) => {
  const { onClose, scenario } = props;
  const dispatch = useDispatch();

  return (
    <Dialog open onClose={onClose} aria-labelledby="delete-dialog-title">
      <Dialog.Title id="delete-dialog-title">Delete Scenario?</Dialog.Title>
      <Dialog.Content>
        <Dialog.ContentText>
          This will permanently delete the scenario and its results. This action can't be undone.
          You can re-run the scenario later if desired.
        </Dialog.ContentText>
      </Dialog.Content>
      <Dialog.Actions>
        <Button.Text onClick={onClose}>Cancel</Button.Text>
        <Button.Text color="primary" onClick={deleteScenario}>Delete</Button.Text>
      </Dialog.Actions>
    </Dialog>
  );

  /** ========================== Callbacks ================================= */
  async function deleteScenario () {
    onClose();

    // Optimistically delete the scenario. This will be reverted if the request fails.
    dispatch(slices.models.removeModel(scenario));

    // Make the DELETE request and set a success or failure message
    const response = await api.deleteScenario(scenario.id);
    if (response.ok) {
      dispatch(slices.ui.setMessage({ msg: 'Scenario deleted.', type: 'success' }));
    } else {
      // Undo optimistic update
      dispatch(slices.models.updateModel(scenario));
      dispatch(slices.ui.setMessage({ msg: 'Delete failed! Please try again.', type: 'error' }));
    }
  }
};
