import * as React from 'react';

import * as api from 'navigader/api';
import { slices } from 'navigader/store';
import { Dialog, Button, Grid, Flex, Typography, FileSize, TextField } from 'navigader/components';
import { CreateSystemProfileParams } from 'navigader/api';
import { useDispatch } from 'react-redux';
import { makeStylesHook } from 'navigader/styles';
import { formatters, serializers } from 'navigader/util';
import { DialogProps } from '../common/CreateDialog';

const useCreateSystemProfileStyles = makeStylesHook(
  () => ({
    fileUpload: {
      display: 'none',
    },
    submitButton: {
      float: 'right',
    },
  }),
  'UploadCard'
);

/* ============================ Components ================================= */
export const CreateSystemProfile: React.FC<DialogProps> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const classes = useCreateSystemProfileStyles();
  const [name, updateName] = React.useState<string>('');
  const [raRate, updateRaRate] = React.useState<number>(6);
  const [file, setFile] = React.useState<File | null>(null);

  const fileUpload = React.useRef<HTMLInputElement>(null);

  const onSubmit = async (params: CreateSystemProfileParams) => {
    api.createSystemProfile(params, (xhr) => {
      if (xhr.status === 201) {
        const response = JSON.parse(xhr.response).system_profile;
        const parsed = serializers.parseSystemProfile(response);
        dispatch(slices.models.updateModel({ ...parsed, object_type: 'SystemProfile' }));
      }
    });
  };

  return (
    <>
      <Dialog fullWidth open={open} onClose={onClose}>
        <Dialog.Title>Create System Profile</Dialog.Title>
        <Dialog.Content>
          <Grid>
            <Grid.Item span={12}>
              <Button color="secondary" onClick={openFileSelector}>
                Select File
              </Button>
            </Grid.Item>

            {file && (
              <Grid.Item span={12}>
                <Flex.Container justifyContent="flex-start">
                  <Flex.Item grow>
                    <Typography useDiv variant="subtitle2">
                      {formatters.truncateAtLength(file.name, 75)}
                    </Typography>
                  </Flex.Item>
                  <Flex.Item>
                    <FileSize size={file.size} />
                  </Flex.Item>
                </Flex.Container>
              </Grid.Item>
            )}
            <Grid.Item span={12}>
              <TextField id="name" label="Name" onChange={updateName} value={name} />
            </Grid.Item>
            <Grid.Item span={12}>
              <TextField
                type="number"
                id="resource_adequacy_rate"
                label="Resource Adequacy Rate"
                onChange={(num) => updateRaRate(parseFloat(num))}
                value={raRate.toString()}
              />
            </Grid.Item>
          </Grid>
        </Dialog.Content>
        <Dialog.Actions>
          <Button.Text onClick={onClose}>Cancel</Button.Text>
          <Button.Text
            color="primary"
            disabled={!file}
            onClick={() => {
              if (file) onSubmit({ name, resource_adequacy_rate: raRate, file });
              onClose();
            }}
          >
            Submit
          </Button.Text>
        </Dialog.Actions>
      </Dialog>
      <input
        accept=".csv"
        className={classes.fileUpload}
        onChange={onFileChange}
        ref={fileUpload}
        type="file"
      />
    </>
  );
  /** ============================== Callbacks =============================== */

  function openFileSelector() {
    fileUpload.current?.click();
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFile(event.target?.files?.item(0) || null);
    updateName(event.target?.files?.item(0)?.name.split('.csv')[0] || '');
  }
};
