import React from 'react';
import { Link } from 'react-router-dom';
import { createUseStyles } from 'react-jss';

import * as api from '@nav/shared/api';
import {
  Alert, AppContainer, Button, Card, Checkbox, Flex, Progress, TextField, Typography
} from '@nav/shared/components';
import * as routes from '@nav/shared/routes';
import { Theme } from '@nav/shared/styles';


/** ============================ Types ===================================== */
type UploadingStatus = 'not started' | 'uploading' | 'success' | 'failure';
type FileCardProps = {
  file: File;
  startUpload: (name: string) => void;
  status: UploadingStatus;
};

/** ============================ Styles ==================================== */
const useStyles = createUseStyles((theme: Theme) => ({
  fileUpload: {
    display: 'none'
  }
}));

const useFileCardStyles = createUseStyles((theme: Theme) => ({
  card: {
    marginTop: theme.spacing(2)
  },
  fileName: {
    width: '100%'
  },
  fileSize: {
    marginLeft: theme.spacing(2)
  },
  item17: {
    cursor: 'pointer',
    display: 'inline-block'
  },
  item17Wrapper: {
    margin: `0 ${theme.spacing(2)}px`
  },
  row2: {
    marginTop: theme.spacing(2)
  },
  uploadingStatus: {
    marginTop: theme.spacing(2)
  }
}));

/** ============================ Components ================================ */
const FileCard: React.FC<FileCardProps> = ({ file, startUpload, status }) => {
  const [useItem17, setUseItem17] = React.useState(false);
  const [name, setFileName] = React.useState('');
  const classes = useFileCardStyles();
  
  const canUpload = useItem17 && Boolean(name) && statusAllowsUpload(status);
  
  return (
    <Card className={classes.card} raised>
      <Flex.Container justifyContent="flex-start">
        <Flex.Item>
          <Typography useDiv variant="subtitle2">{file.name}</Typography>
        </Flex.Item>
        <Flex.Item className={classes.fileSize}>
          <Typography color="textSecondary" variant="body2">
            {renderFileSize(file.size)}
          </Typography>
        </Flex.Item>
      </Flex.Container>
      
      <Flex.Container className={classes.row2}>
        <Flex.Item grow>
          <TextField
            className={classes.fileName}
            id="file-name"
            label="File Name"
            onChange={handleNameChange}
            outlined
          />
        </Flex.Item>
        
        <Flex.Item className={classes.item17Wrapper}>
          <div className={classes.item17} onClick={toggleItem17}>
            <Checkbox checked={useItem17} />
            <Typography>Confirm "Item 17" file</Typography>
          </div>
        </Flex.Item>
        
        <Flex.Item grow textAlign="right">
          <Button color="secondary" disabled={!canUpload} onClick={handleUploadClick}>
            Upload
          </Button>
        </Flex.Item>
      </Flex.Container>
      
      {status !== 'not started' &&
        <div className={classes.uploadingStatus}>
          {status === 'uploading' && <Progress />}
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
                The upload failed. Please try again or contact support.
              </Typography>
            </Alert>
          }
        </div>
      }
    </Card>
  );
  
  /** ============================ Callbacks =============================== */
  function handleNameChange (event: React.ChangeEvent<HTMLInputElement>) {
    setFileName(event.target.value);
  }
  
  function handleUploadClick () {
    if (statusAllowsUpload(status)) {
      startUpload(name);
    }
  }
  
  function toggleItem17 () {
    setUseItem17(!useItem17);
  }
};

const UploadPage: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = React.useState<UploadingStatus>('not started');
  const fileUpload = React.useRef<HTMLInputElement>(null);
  const classes = useStyles();
  
  return (
    <AppContainer>
      <Typography useDiv variant="h4">Upload</Typography>
      <Button color="primary" onClick={openFileSelector}>Select File</Button>
      
      {/** Deliberately hidden input. This is controlled programmatically */}
      <input
        accept=".csv"
        className={classes.fileUpload}
        onChange={selectFile}
        ref={fileUpload}
        type="file"
      />
      
      {file && <FileCard file={file} startUpload={startUpload} status={uploadStatus} />}
    </AppContainer>
  );
  
  /** ============================ Callbacks =============================== */
  function openFileSelector () {
    if (fileUpload.current) {
      fileUpload.current.click();
    }
  }
  
  function selectFile (event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) {
      // Not sure why this would happen, but TypeScript thinks it can be `null`
      setFile(null);
      return;
    }
    
    const file = event.target.files.item(0);
    if (!file) {
      // File was de-selected
      setFile(null);
      return;
    }
    
    setFile(file);
  }
  
  async function startUpload (name: string) {
    if (!file) return;
    
    try {
      setUploadStatus('uploading');
      const response = await api.postOriginFile(file, name);
      setUploadStatus(response.status === 204 ? 'success' : 'failure');
    } catch (e) {
      setUploadStatus('failure');
    }
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

/** ============================ Exports =================================== */
export default UploadPage;
