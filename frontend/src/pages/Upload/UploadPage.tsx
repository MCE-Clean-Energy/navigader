import React from 'react';
import { createUseStyles } from 'react-jss';

import { AppContainer, Button, Card, Checkbox, Flex, Typography } from '@nav/shared/components';
import { Theme } from '@nav/shared/styles';


/** ============================ Types ===================================== */
type Item17File = {
  name: string;
  size: number;
};

type FileCardProps = {
  file: Item17File
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
  item17: {
    cursor: 'pointer',
    display: 'inline-block'
  }
}));

/** ============================ Components ================================ */
const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const [useItem17, setUseItem17] = React.useState(false);
  const classes = useFileCardStyles();
  
  return (
    <Card className={classes.card} raised>
      <Flex.Container>
        <Flex.Item>
          <Typography useDiv variant="h6">{file.name}</Typography>
        </Flex.Item>
        <Flex.Item>
          <Typography color="textSecondary" variant="body2">
            {renderFileSize(file.size)}
          </Typography>
        </Flex.Item>
      </Flex.Container>
      
      <Flex.Container>
        <Flex.Item grow>
          <div>
            <div className={classes.item17} onClick={toggleItem17}>
              <Checkbox checked={useItem17} />
              <Typography>Confirm "Item 17" file</Typography>
            </div>
          </div>
        </Flex.Item>
        <Flex.Item>
        </Flex.Item>
      </Flex.Container>
      
    </Card>
  );
  
  /** ============================ Callbacks =============================== */
  function toggleItem17 () {
    setUseItem17(!useItem17);
  }
};

const UploadPage: React.FC = () => {
  const [file, setFile] = React.useState<Item17File | null>(null);
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
      
      {file && <FileCard file={file} />}
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
    
    setFile({
      name: file.name,
      size: file.size
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

/** ============================ Exports =================================== */
export default UploadPage;
