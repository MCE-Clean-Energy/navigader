import * as React from 'react';
import { useDispatch } from 'react-redux';

import * as api from 'navigader/api';
import { Dialog, Button, Grid, Flex, Typography, FileSize, TextField } from 'navigader/components';
import { slices } from 'navigader/store';
import { makeStylesHook } from 'navigader/styles';
import { CAISORate, Nullable } from 'navigader/types';
import { formatters } from 'navigader/util';

import { DialogProps } from '../common/CreateDialog';

/** ============================ Styles ==================================== */
const useCreateCAISORateStyles = makeStylesHook(
  () => ({
    fileUpload: { display: 'none' },
    submitButton: { float: 'right' },
  }),
  'CreateCAISORate'
);

/** ============================ Components ================================ */
export const CreateCAISORate: React.FC<DialogProps<CAISORate>> = ({ open, onClose, tableRef }) => {
  const dispatch = useDispatch();
  const classes = useCreateCAISORateStyles();
  const fileUpload = React.useRef<HTMLInputElement>(null);

  // State
  const [name, updateName] = React.useState('');
  const [file, setFile] = React.useState<Nullable<File>>(null);
  const [year, updateYear] = React.useState(new Date().getFullYear());

  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <Dialog.Title>Create Procurement Rate</Dialog.Title>
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
              id="year"
              label="Year"
              onChange={(num) => updateYear(parseInt(num))}
              value={year.toString()}
            />
          </Grid.Item>
        </Grid>

        <input
          accept=".csv"
          className={classes.fileUpload}
          onChange={onFileChange}
          ref={fileUpload}
          type="file"
        />
      </Dialog.Content>
      <Dialog.Actions>
        <Button.Text onClick={onClose}>Cancel</Button.Text>
        <Button.Text color="primary" disabled={!file} onClick={onSubmit}>
          Submit
        </Button.Text>
      </Dialog.Actions>
    </Dialog>
  );

  /** ============================== Callbacks =============================== */
  function onSubmit() {
    if (!file) return;

    api.createCAISORate({ name, year, file }, (xhr) => {
      if (xhr.status === 201) {
        tableRef.current?.fetch();
        onClose();
      } else {
        dispatch(slices.ui.setMessage({ msg: 'Something went wrong', type: 'error' }));
      }
    });
  }

  function openFileSelector() {
    fileUpload.current?.click();
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target?.files?.item(0) || null;
    setFile(file);
    updateName(file?.name.split('.csv')[0] || '');
  }
};
