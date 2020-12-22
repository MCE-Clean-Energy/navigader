import * as React from 'react';
import { useDispatch } from 'react-redux';

import * as api from 'navigader/api';
import {
  Alert,
  Button,
  Card,
  Collapse,
  ContactSupport,
  FileSize,
  Flex,
  Grid,
  Link,
  PageHeader,
  Progress,
  TextField,
  Typography,
} from 'navigader/components';
import { routes } from 'navigader/routes';
import { slices } from 'navigader/store';
import { makeStylesHook } from 'navigader/styles';
import { Maybe } from 'navigader/types';
import { HELP_PAGE_URI } from 'navigader/util';

/** ============================ Types ===================================== */
type UploadingStatus = 'not started' | 'uploading' | 'success' | 'failure';
type FileCardProps = {
  file: Maybe<File>;
  progress: Maybe<number>;
  startUpload: (name: string) => void;
  status: UploadingStatus;
};

type UploadCardProps = {
  minutes: 15 | 60;
};

/** ============================ Styles ==================================== */
const useFileCardStyles = makeStylesHook(
  (theme) => ({
    fileName: {
      width: '100%',
    },
    fileSize: {
      marginLeft: theme.spacing(2),
    },
    row2: {
      marginTop: theme.spacing(2),
    },
    uploadButton: {
      marginLeft: theme.spacing(2),
    },
    uploadingStatus: {
      marginTop: theme.spacing(2),
    },
  }),
  'UploadFileCard'
);

const useUploadCardStyles = makeStylesHook(
  (theme) => ({
    card: {
      margin: theme.spacing(2),
    },
    fileUpload: {
      display: 'none',
    },
    image: {
      backgroundPosition: '0 0',
      height: 240,
    },
  }),
  'UploadCard'
);

const useFileFormatAlertStyles = makeStylesHook(
  (theme) => ({
    bulletList: {
      'margin': `${theme.spacing(1)}px 0`,
      '& li': {
        lineHeight: 1.75,
      },
    },
  }),
  'FileFormatAlert'
);

/** ============================ Components ================================ */
const FileComponent: React.FC<FileCardProps> = ({ file, progress, startUpload, status }) => {
  const [name, setFileName] = React.useState('');
  const classes = useFileCardStyles();
  const canUpload = Boolean(name) && statusAllowsUpload(status);

  React.useEffect(() => {
    // Strip the `.csv` from the end of the file name
    if (file) {
      setFileName(file.name.replace(/.csv$/, ''));
    }
  }, [file]);

  if (!file) return null;
  return (
    <Card.Content>
      <Flex.Container justifyContent="flex-start">
        <Flex.Item>
          <Typography useDiv variant="subtitle2">
            {file.name}
          </Typography>
        </Flex.Item>
        <Flex.Item className={classes.fileSize}>
          <FileSize size={file.size} />
        </Flex.Item>
      </Flex.Container>

      <Flex.Container alignItems="center" className={classes.row2}>
        <Flex.Item grow>
          <TextField
            className={classes.fileName}
            id="file-name"
            label="Upload Name"
            onChange={handleNameChange}
            outlined
            value={name}
          />
        </Flex.Item>

        <Flex.Item textAlign="right">
          <Button
            className={classes.uploadButton}
            color="secondary"
            disabled={!canUpload}
            onClick={handleUploadClick}
            data-testid="upload-button"
          >
            Upload
          </Button>
        </Flex.Item>
      </Flex.Container>

      {status !== 'not started' && (
        <div className={classes.uploadingStatus}>
          {status === 'uploading' && <Progress value={progress} />}
          {status === 'success' && (
            <Alert title="Success!" type="success">
              <Typography variant="body2">
                The upload was successful. Check it out in the{' '}
                <Link to={routes.library.base}>Library</Link>.
              </Typography>
            </Alert>
          )}
          {status === 'failure' && (
            <Alert title="Error" type="error">
              <Typography>
                The upload failed. Please try again or <ContactSupport />.
              </Typography>
            </Alert>
          )}
        </div>
      )}
    </Card.Content>
  );

  /** ========================== Callbacks ================================= */
  function handleNameChange(newName: string) {
    setFileName(newName);
  }

  function handleUploadClick() {
    if (statusAllowsUpload(status)) {
      startUpload(name);
    }
  }
};

const FileFormatAlert: React.FC = () => {
  const classes = useFileFormatAlertStyles();
  const expectedColumns = [
    [
      'SA_ID',
      <span>
        The ID of the customer. Can also be <Typography.Code>SA</Typography.Code>
      </span>,
    ],
    ['UOM', 'Unit Of Measure. This specifies the units of the load data. Should be "KW" or "KWH"'],
    ['DATE', "The date of each row's data"],
    ['DIR', 'The direction of electricity flow. Should be "D" (for direct) or "R" (for reverse)'],
    ['RS', "The customer's rate schedule"],
    ['Interval columns', 'See above'],
    [
      'therms',
      `
        (optional) The customer's daily gas usage in therms. If this column is provided, therm 
        usage data should be provided only on rows where DIR is "D", not when it is "R". It is
        perfectly acceptable if therm usage data is only available for some but not all days
      `.trim(),
    ],
  ];

  return (
    <Alert outlined title="File Criteria" type="info">
      <Typography paragraph variant="body2">
        NavigaDER expects customer data to be provided in a CSV file. Each row should represent the
        customer's load over the course of a single day. The following columns are expected:
      </Typography>

      <ul className={classes.bulletList}>
        {expectedColumns.map(([column, explainer], i) => (
          <li key={i}>
            <Typography.Code>{column}</Typography.Code>: {explainer}.
          </li>
        ))}
      </ul>

      <Typography paragraph variant="body2">
        Other columns may be included in the file and will be ignored.
      </Typography>

      <Typography paragraph variant="body2">
        Additionally, all customer data within the same upload file{' '}
        <strong>must be confined to the same calendar year</strong>. If the earliest date in the{' '}
        <Typography.Code>DATE</Typography.Code> column and the latest date in the{' '}
        <Typography.Code>DATE</Typography.Code> column are in different calendar years, the file
        will not be available for running simulations.
      </Typography>

      <Typography paragraph variant="body2">
        {HELP_PAGE_URI ? (
          <span>
            For guidance on how to combine electric interval data and gas interval data into a
            single "hybrid gas-electric interval" file, instructional videos about NavigaDER and
            general troubleshooting tips, visit the{' '}
            <Link.NewTab to={HELP_PAGE_URI}>help page</Link.NewTab>.{' '}
          </span>
        ) : null}
        If you have trouble with an upload, please <ContactSupport />.
      </Typography>
    </Alert>
  );
};

const UploadCard: React.FC<UploadCardProps> = ({ minutes }) => {
  const classes = useUploadCardStyles();
  const dispatch = useDispatch();
  const fileUpload = React.useRef<HTMLInputElement>(null);

  // Component state
  const [file, setFile] = React.useState<File>();
  const [uploadStatus, setUploadStatus] = React.useState<UploadingStatus>('not started');
  const [uploadProgress, setUploadProgress] = React.useState<number>();

  const fileName = `example_load_data_${minutes}_min`;
  return (
    <Grid.Item span={6}>
      <Card className={classes.card} padding={0} raised>
        <Card.ActionArea onClick={openFileSelector}>
          <Card.Media
            className={classes.image}
            image={`/img/${fileName}.png`}
            title={`Example ${minutes}-minute load data`}
          />

          <Card.Content>
            <Typography variant="h5" useDiv>
              {minutes}-Minute Intervals
            </Typography>
            <Typography variant="body2" color="textSecondary">
              In addition to the columns described below, {minutes}-minute interval files should
              contain columns for every {minutes} minutes of the day, as seen in the image. There
              should be {(24 * 60) / minutes} interval columns in total.
            </Typography>
          </Card.Content>
        </Card.ActionArea>

        <Card.Actions>
          <Button color="primary" icon="upload" onClick={openFileSelector} size="small">
            Upload File
          </Button>

          <Button.Text color="primary" icon="download" onClick={downloadExample} size="small">
            Download Example
          </Button.Text>
        </Card.Actions>

        <Collapse open={Boolean(file)}>
          <FileComponent
            file={file}
            progress={uploadProgress}
            startUpload={startUpload}
            status={uploadStatus}
          />
        </Collapse>
      </Card>

      {/** Deliberately hidden input. This is controlled programmatically */}
      <input
        accept=".csv"
        className={classes.fileUpload}
        data-testid={`hidden-upload-input-${minutes}`}
        onChange={selectFile}
        ref={fileUpload}
        type="file"
      />
    </Grid.Item>
  );

  /** ========================== Callbacks ================================= */
  function downloadExample() {
    const csvName = fileName + '.csv';
    api.util.downloadFile(`/downloads/load_data/${csvName}`, csvName).catch(() =>
      dispatch(
        slices.ui.setMessage({
          msg: 'Something went wrong.',
          type: 'error',
        })
      )
    );
  }

  function openFileSelector() {
    fileUpload.current?.click();
  }

  function selectFile(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) {
      // Not sure why this would happen, but TypeScript thinks it can be `null`
      setFile(undefined);
      return;
    }

    const file = event.target.files.item(0);
    if (!file) {
      // File was de-selected
      setFile(undefined);
      return;
    }

    setFile(file);
    setUploadStatus('not started');
  }

  async function startUpload(name: string) {
    if (!file) return;

    setUploadStatus('uploading');
    setUploadProgress(0);
    const xhr = api.postOriginFile(file, name);

    // Update the progress bar with the `progress` event
    xhr.upload.addEventListener('progress', (evt) => {
      const percentComplete = (evt.loaded / evt.total) * 100;
      setUploadProgress(percentComplete);
    });

    // When the request completes, update the status
    xhr.addEventListener('readystatechange', () => {
      if (xhr.readyState === 4) {
        setUploadStatus(xhr.status === 201 ? 'success' : 'failure');
        setUploadProgress(undefined);
      }
    });
  }
};

export const UploadPage: React.FC = () => {
  return (
    <>
      <PageHeader title="Upload" />
      <Grid>
        <UploadCard minutes={15} />
        <UploadCard minutes={60} />
      </Grid>
      <FileFormatAlert />
    </>
  );
};

/** ============================ Helpers =================================== */

/**
 * Returns `true` if the uploading status is either "not started" or "failure"
 *
 * @param {UploadingStatus} status: the current uploading status
 */
function statusAllowsUpload(status: UploadingStatus) {
  const uploadableStatuses: UploadingStatus[] = ['not started', 'failure'];
  return uploadableStatuses.includes(status);
}
