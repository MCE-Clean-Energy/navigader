import * as React from 'react';
import { useDispatch } from 'react-redux';

import * as api from 'navigader/api';
import { Dialog, Button, TextField, Select, Grid } from 'navigader/components';
import { slices } from 'navigader/store';

/** ============================ Types ===================================== */
type CreateRatePlanDialogProps = {
  closeDialog: () => void;
  open: boolean;
};

/** ============================ Components ================================ */
export const CreateRatePlanDialog: React.FC<CreateRatePlanDialogProps> = ({
  closeDialog,
  open,
}) => {
  const dispatch = useDispatch();
  const [name, updateName] = React.useState('');
  const [sector, updateSector] = React.useState('Residential');

  return (
    <Dialog fullWidth open={open} onClose={closeDialog}>
      <Dialog.Title>Create Rate Plan</Dialog.Title>
      <Dialog.Content>
        <Grid>
          <Grid.Item span={12}>
            <TextField
              autoFocus
              id="name"
              label="Rate Plan Name"
              onChange={updateName}
              value={name}
            />
          </Grid.Item>
          <Grid.Item span={12}>
            <Select
              label="Sector"
              onChange={updateSector}
              options={['Commercial', 'Residential', 'Industrial', 'Agricultural', 'Lighting']}
              value={sector}
            />
          </Grid.Item>
        </Grid>
      </Dialog.Content>
      <Dialog.Actions>
        <Button.Text onClick={closeDialog}>Cancel</Button.Text>
        <Button.Text color="primary" disabled={!name.length} onClick={handleSubmission}>
          Submit
        </Button.Text>
      </Dialog.Actions>
    </Dialog>
  );

  /** ========================== Callbacks ================================= */
  async function handleSubmission() {
    const response = await api.createRatePlan({ name, sector });
    dispatch(slices.models.updateModel(response));
    closeDialog();
  }
};
