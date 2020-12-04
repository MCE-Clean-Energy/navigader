import * as React from 'react';
import { useDispatch } from 'react-redux';

import * as api from 'navigader/api';
import {
  Dialog,
  Button,
  Grid,
  Flex,
  Typography,
  FileSize,
  TextField,
  Menu,
  List,
} from 'navigader/components';
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
          <Grid.Item span={6}>
            <Button color="secondary" onClick={openFileSelector}>
              Select File
            </Button>
          </Grid.Item>
          <Grid.Item span={6}>
            <Menu
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              label="Download Example"
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
              <List.Item onClick={() => downloadExample(15)}>
                <List.Item.Text>15 Minute Example</List.Item.Text>
              </List.Item>
              <List.Item onClick={() => downloadExample(60)}>
                <List.Item.Text>60 Minute Example</List.Item.Text>
              </List.Item>
            </Menu>
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

  function downloadExample(minutes: 15 | 60) {
    const csvName = `example_procurement_rate_${minutes}_min.csv`;
    api.util.downloadFile('/downloads/procurement/' + csvName, csvName).catch(() =>
      dispatch(
        slices.ui.setMessage({
          msg: 'Something went wrong.',
          type: 'error',
        })
      )
    );
  }
};
