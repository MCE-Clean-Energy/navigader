import * as React from 'react';

import * as api from 'navigader/api';
import {
  Alert, Button, Card, ContactSupport, Flex, Link, PageHeader, Progress, TextField, Typography
} from 'navigader/components';
import * as routes from 'navigader/routes';
import { makeStylesHook } from 'navigader/styles';


/** ============================ Types ===================================== */
type UploadingStatus = 'not started' | 'uploading' | 'success' | 'failure';
type FileCardProps = {
  file?: File;
  progress?: number;
  startUpload: (name: string) => void;
  status: UploadingStatus;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  fileUpload: {
    display: 'none'
  },
  uploadButton: {
    margin: `${theme.spacing(2)}px 0`
  }
}), 'UploadPage');

const useFileCardStyles = makeStylesHook(theme => ({
  fileName: {
    width: '100%'
  },
  fileSize: {
    marginLeft: theme.spacing(2)
  },
  row2: {
    marginTop: theme.spacing(2)
  },
  uploadingStatus: {
    marginTop: theme.spacing(2)
  }
}), 'UploadFileCard');

const useFileFormatAlertStyles = makeStylesHook(theme => ({
  bulletList: {
    margin: `${theme.spacing(1)}px 0`
  }
}), 'FileFormatAlert');

/** ============================ Components ================================ */
const FileCard: React.FC<FileCardProps> = ({ file, progress, startUpload, status }) => {
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
    <Card raised>
      <Flex.Container justifyContent="flex-start">
        <Flex.Item>
          <Typography useDiv variant="subtitle2">{file.name}</Typography>
        </Flex.Item>
        <Flex.Item className={classes.fileSize}>
          <Typography color="textSecondary" variant="body2">{renderFileSize(file.size)}</Typography>
        </Flex.Item>
      </Flex.Container>

      <Flex.Container className={classes.row2}>
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

        <Flex.Item grow textAlign="right">
          <Button
            color="secondary"
            disabled={!canUpload}
            onClick={handleUploadClick}
            data-testid="upload-button"
          >
            Upload
          </Button>
        </Flex.Item>
      </Flex.Container>

      {status !== 'not started' &&
        <div className={classes.uploadingStatus}>
          {status === 'uploading' && <Progress value={progress} />}
          {status === 'success' &&
            <Alert title="Success!" type="success">
              <Typography variant="body2">
                The upload was successful. Check it out on the <Link to={routes.load}>Load page</Link>.
              </Typography>
            </Alert>
          }
          {status === 'failure' &&
            <Alert title="Error" type="error">
              <Typography>
                The upload failed. Please try again or <ContactSupport />.
              </Typography>
            </Alert>
          }
        </div>
      }
    </Card>
  );

  /** ========================== Callbacks ================================= */
  function handleNameChange (newName: string) {
    setFileName(newName);
  }

  function handleUploadClick () {
    if (statusAllowsUpload(status)) {
      startUpload(name);
    }
  }
};

const FileFormatAlert: React.FC = () => {
  const classes = useFileFormatAlertStyles();
  return (
    <Alert outlined title="File Format" type="info">
      NavigaDER expects customer data to be provided in the "Item 17" format. See the examples
      below:

      <ul className={classes.bulletList}>
        <li>
          <Link to="/example_item_17_15_min.csv" download="example_item_17_15_min.csv">
            15-minute interval file
          </Link>
        </li>
        <li>
          <Link to="/example_item_17_60_min.csv" download="example_item_17_60_min.csv">
            60-minute interval file
          </Link>
        </li>
      </ul>
    </Alert>
  );
};

export const UploadPage: React.FC = () => {
  const [file, setFile] = React.useState<File>();
  const [uploadStatus, setUploadStatus] = React.useState<UploadingStatus>('not started');
  const [uploadProgress, setUploadProgress] = React.useState<number>();
  const fileUpload = React.useRef<HTMLInputElement>(null);
  const classes = useStyles();

  return (
    <>
      <PageHeader title="Upload" />
      <FileFormatAlert />

      <div className={classes.uploadButton}>
        <Button color="primary" onClick={openFileSelector}>Select File</Button>
      </div>

      {/** Deliberately hidden input. This is controlled programmatically */}
      <input
        accept=".csv"
        className={classes.fileUpload}
        data-testid="hidden-upload-input"
        onChange={selectFile}
        ref={fileUpload}
        type="file"
      />

      <FileCard
        file={file}
        progress={uploadProgress}
        startUpload={startUpload}
        status={uploadStatus}
      />
    </>
  );

  /** ========================== Callbacks ================================= */
  function openFileSelector () {
    if (fileUpload.current) {
      fileUpload.current.click();
    }
  }

  function selectFile (event: React.ChangeEvent<HTMLInputElement>) {
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

  async function startUpload (name: string) {
    if (!file) return;

    setUploadStatus('uploading');
    setUploadProgress(0);
    const xhr = api.postOriginFile(file, name);

    // Update the progress bar with the `progress` event
    xhr.upload.addEventListener('progress', (evt) => {
      const percentComplete = (evt.loaded / evt.total * 100);
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

/** ============================ Helpers =================================== */
const units = ['byte', 'KB', 'MB', 'GB'];
const maxIndex = units.length - 1;

export function renderFileSize (size: number) {
  if (size <= 0) return '';

  let power = Math.floor(Math.log(size) / Math.log(1000));
  if (power > maxIndex) {
    power = maxIndex;
  }

  const val = size / Math.pow(1000, power);

  let suffix;
  if (power === 0) {
    // If the power is 0, we may pluralize the unit ("byte" vs "bytes")
    suffix = val === 1 ? 'byte' : 'bytes';
  } else {
    suffix = units[power];
  }

  return `${parseFloat(val.toFixed(1))} ${suffix}`;
}

/**
 * Returns `true` if the uploading status is either "not started" or "failure"
 *
 * @param {UploadingStatus} status: the current uploading status
 */
function statusAllowsUpload (status: UploadingStatus) {
  const uploadableStatuses: UploadingStatus[] = ['not started', 'failure'];
  return uploadableStatuses.includes(status);
}
