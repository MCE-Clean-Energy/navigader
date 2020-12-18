import * as React from 'react';

import * as api from 'navigader/api';
import { AlertType, Maybe } from 'navigader/types';
import { formatters, percentOf } from 'navigader/util';
import { Button } from './Button';
import { ContactSupport } from './ContactSupport';
import { AlertSnackbar } from './Snackbar';
import { Tooltip } from './Tooltip';
import { Typography } from './Typography';

/** ============================ Types ===================================== */
type DownloadStatus = 'downloading' | 'error' | 'success';
type FileDownloadProps = {
  downloadFn: (cb: api.util.ProgressCallback) => Promise<unknown>;
};

type FileSizeProps = {
  size: number;
};

/** ============================ Components ================================ */
export const FileDownload: React.FC<FileDownloadProps> = ({ downloadFn }) => {
  // Component state
  const [status, setStatus] = React.useState<DownloadStatus>();
  const [progress, setProgress] = React.useState<number>(0);

  // Get the alert message and type in an IIFE
  const [type, message] = ((): [Maybe<AlertType>, React.ReactNode] => {
    switch (status) {
      case 'downloading':
        return ['info', `Downloading file... ${Math.round(progress)}% complete`];
      case 'error':
        return [
          'error',
          <Typography>
            Download failed! Please try again or <ContactSupport />.
          </Typography>,
        ];
      case 'success':
        return ['success', 'Download complete!'];
      default:
        return [undefined, null];
    }
  })();

  const snackbarProps = {
    msg: message,
    onClose: status === 'downloading' ? undefined : closeSnackbar,
    open: Boolean(status),
    type,
  };

  return (
    <>
      <Tooltip title="Download">
        <Button disabled={Boolean(status)} icon="download" onClick={downloadData} />
      </Tooltip>
      <AlertSnackbar {...snackbarProps} />
    </>
  );

  /** ========================== Callbacks ================================= */
  async function downloadData() {
    try {
      setStatus('downloading');
      await downloadFn((progress, total) => setProgress(percentOf(progress, total)));
      setStatus('success');
    } catch (e) {
      setStatus('error');
    }
  }

  function closeSnackbar() {
    setStatus(undefined);
    setProgress(0);
  }
};

export const FileSize: React.FC<FileSizeProps> = ({ size }) => {
  return (
    <Typography color="textSecondary" variant="body2">
      {formatters.fileSize(size)}
    </Typography>
  );
};
