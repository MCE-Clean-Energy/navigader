import * as React from 'react';

import * as api from 'navigader/api';
import { slices } from 'navigader/store';
import { Dialog, Button, TextField, Select, Grid } from 'navigader/components';
import { CreateRatePlanParams } from 'navigader/api';
import { useDispatch } from 'react-redux';
import { DialogProps } from '../../common/CreateDialog';

/* ============================ Components ================================= */
export const CreateRatePlan: React.FC<DialogProps> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  let [name, updateName] = React.useState<string>('');
  let [sector, updateSector] = React.useState<string>('Residential');

  const onSubmit = async (params: CreateRatePlanParams) => {
    const response = await api.createRatePlan(params);
    dispatch(slices.models.updateModel(response));
    return response;
  };

  return (
    <>
      <Dialog fullWidth open={open} onClose={onClose}>
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
          <Button.Text onClick={onClose}>Cancel</Button.Text>
          <Button.Text
            color="primary"
            disabled={!name.length}
            onClick={() => {
              onSubmit({ name, sector });
              onClose();
            }}
          >
            Submit
          </Button.Text>
        </Dialog.Actions>
      </Dialog>
    </>
  );
};
