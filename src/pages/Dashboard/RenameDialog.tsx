import * as React from 'react';
import { useDispatch } from 'react-redux';

import * as api from 'navigader/api';
import { Button, Dialog, TextField } from 'navigader/components';
import { Scenario } from 'navigader/models/scenario';
import { setMessage } from 'navigader/store/slices/ui';
import { updateModel } from 'navigader/store/slices/models';


/** ============================ Types ===================================== */
type RenameDialogProps = {
  onClose: () => void;
  scenario: Scenario;
};

/** ============================ Components ================================ */
const RenameDialog: React.FC<RenameDialogProps> = (props) => {
  const { onClose, scenario } = props;
  const [name, setName] = React.useState(scenario.name);
  const dispatch = useDispatch();
  
  return (
    <Dialog open onClose={onClose} aria-labelledby="rename-dialog-title">
      <Dialog.Title id="rename-dialog-title">Rename Scenario</Dialog.Title>
      <Dialog.Content>
        <Dialog.ContentText>
          The Names can be at most 128 characters long.
        </Dialog.ContentText>

        <TextField autoFocus id="name" label="Scenario name" onChange={updateName} value={name} />
      </Dialog.Content>
      <Dialog.Actions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          color="primary"
          disabled={name.length === 0}
          onClick={renameScenario}
        >
          Rename
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
  
  /** ============================ Callbacks =============================== */
  async function renameScenario () {
    onClose();
    
    // Optimistically update the scenario. This will be reverted if the update fails
    const originalName = scenario.name;
    dispatch(updateModel({ ...scenario, name }));
    
    // Make the PATCH request and set a success or failure message
    const response = await api.patchScenario(scenario.id, { name });
    if (response.ok) {
      dispatch(setMessage({ msg: 'Rename successful.', type: 'success' }));
    } else {
      // Undo optimistic update
      dispatch(updateModel({ ...scenario, name: originalName }));
      dispatch(setMessage({ msg: 'Rename failed! Please try again.', type: 'error' }));
    }
  }
  
  function updateName (newName: string) {
    setName(newName);
  }
};

/** ============================ Exports =================================== */
export default RenameDialog;
