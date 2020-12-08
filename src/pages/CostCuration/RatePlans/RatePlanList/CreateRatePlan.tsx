import * as React from 'react';

import * as api from 'navigader/api';
import { Dialog, Button, TextField, Select, Grid } from 'navigader/components';
import { RatePlan } from 'navigader/types';

import { DialogProps } from '../../common/CreateDialog';

/** ============================ Components ================================ */
export const CreateRatePlan: React.FC<DialogProps<RatePlan>> = ({ open, onClose, tableRef }) => {
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
    await api.createRatePlan({ name, sector });
    tableRef.current?.fetch();
    onClose();
  }
};
