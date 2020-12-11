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
import { usePushRouter } from 'navigader/routes';
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
export const CreateCAISORate: React.FC<DialogProps> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const routeTo = usePushRouter();
  const classes = useCreateCAISORateStyles();
  const fileUpload = React.useRef<HTMLInputElement>(null);

  // State
  const [name, updateName] = React.useState('');
  const [file, setFile] = React.useState<Nullable<File>>(null);

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
              label="Download Template"
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
              <List.Item onClick={() => downloadTemplate(15)}>
                <List.Item.Text>15 Minute Template</List.Item.Text>
              </List.Item>
              <List.Item onClick={() => downloadTemplate(60)}>
                <List.Item.Text>60 Minute Template</List.Item.Text>
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
  async function onSubmit() {
    if (!file) return;

    const response = await api.createCAISORate({ name, file });
    if (!response.ok) {
      dispatch(slices.ui.setMessage({ msg: 'Something went wrong', type: 'error' }));
      return;
    }

    // Navigate to the details page
    onClose();
    const caisoRate: CAISORate = (await response.json()).caiso_rate;
    routeTo.cost.procurement.caisoRate(caisoRate)();
  }

  function openFileSelector() {
    fileUpload.current?.click();
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target?.files?.item(0) || null;
    setFile(file);
    updateName(file?.name.split('.csv')[0] || '');
  }

  function downloadTemplate(minutes: 15 | 60) {
    const csvName = `procurement_rate_${minutes}_min_template.csv`;
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
