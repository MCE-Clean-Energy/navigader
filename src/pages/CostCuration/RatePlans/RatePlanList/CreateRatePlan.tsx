import * as React from 'react';

import * as api from 'navigader/api';
import { Dialog, Button, TextField, Select, Grid } from 'navigader/components';
import { usePushRouter } from 'navigader/routes';

import { DialogProps } from '../../common/CreateDialog';

/** ============================ Components ================================ */
export const CreateRatePlan: React.FC<DialogProps> = ({ open, onClose }) => {
  const routeTo = usePushRouter();
  const [name, setName] = React.useState('');
  const [sector, setSector] = React.useState('Residential');

  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <Dialog.Title>Create Rate Plan</Dialog.Title>
      <Dialog.Content>
        <Grid>
          <Grid.Item span={12}>
            <TextField autoFocus id="name" label="Rate Plan Name" onChange={setName} value={name} />
          </Grid.Item>
          <Grid.Item span={12}>
            <Select
              label="Sector"
              onChange={setSector}
              options={['Commercial', 'Residential', 'Industrial', 'Agricultural', 'Lighting']}
              value={sector}
            />
          </Grid.Item>
        </Grid>
      </Dialog.Content>
      <Dialog.Actions>
        <Button.Text onClick={onClose}>Cancel</Button.Text>
        <Button.Text color="primary" disabled={!name.length} onClick={handleSubmission}>
          Submit
        </Button.Text>
      </Dialog.Actions>
    </Dialog>
  );

  /** ========================== Callbacks ================================= */
  async function handleSubmission() {
    const ratePlan = await api.createRatePlan({ name, sector });

    // Navigate to the details page
    onClose();
    routeTo.cost.rates.ratePlan(ratePlan)();
  }
};
