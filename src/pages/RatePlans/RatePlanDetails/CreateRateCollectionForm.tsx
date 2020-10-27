import * as React from "react";
import { Button, Card, Grid, Typography, Flex } from "navigader/components";
import { makeStylesHook } from "navigader/styles";
import { formatters } from "navigader/util";
import { CreateRateCollectionParams } from "navigader/api";
import { useParams } from "react-router-dom";

/** ============================ Types ===================================== */
export type FormErrorObject = {
  [field: string]: string[];
};

export type ErrorDetailProps = {
  errors: FormErrorObject;
};

export type CreateRateCollectionFormProps = {
  open: boolean;
  onSubmit: (params: CreateRateCollectionParams) => void;
  errors: FormErrorObject | undefined;
};

/** ============================ Styles ==================================== */
const useCreateRateCollectionStyles = makeStylesHook(
  () => ({
    fileUpload: {
      display: "none",
    },
    submitButton: {
      float: "right",
    },
  }),
  "UploadCard"
);

/** ============================ Components ================================ */
const ErrorDetails: React.FC<ErrorDetailProps> = (params) => {
  const { errors } = params;
  return (
    <>
      {Object.keys(errors).map((field: string) => (
        <Grid.Item key={field} span={12}>
          <Grid>
            <Grid.Item span={6}>
              <Typography color="error" variant="body2">
                {field}:
              </Typography>
            </Grid.Item>
            <Grid.Item span={6}>
              <Typography color="error" variant="body2">
                {errors[field]}
              </Typography>
            </Grid.Item>
          </Grid>
        </Grid.Item>
      ))}
    </>
  );
};

export const CreateRateCollectionForm: React.FC<CreateRateCollectionFormProps> = ({
  open,
  onSubmit,
  errors,
}) => {
  const classes = useCreateRateCollectionStyles();
  const fileUpload = React.useRef<HTMLInputElement>(null);
  const { id } = useParams<{ id: string }>();
  let [file, setFile] = React.useState<File | null>(null);

  return (
    <>
      <Card hidden={!open}>
        <Card.Content>
          <Grid>
            <Grid.Item span={12}>
              <Button color="secondary" onClick={openFileSelector}>
                Select Rate File
              </Button>
            </Grid.Item>
          </Grid>
          <Grid.Item span={12}>
            {file && (
              <Flex.Container justifyContent="flex-start">
                <Flex.Item grow>
                  <Typography useDiv variant="subtitle2">
                    {formatters.truncateAtLength(file.name, 20)}
                  </Typography>
                </Flex.Item>
                <Flex.Item>
                  <Typography variant="body2">
                    {formatters.renderFileSize(file.size)}
                  </Typography>
                </Flex.Item>
              </Flex.Container>
            )}
          </Grid.Item>
          {errors && <ErrorDetails errors={errors} />}
        </Card.Content>
        <Card.Actions className={classes.submitButton}>
          <Button.Text
            disabled={!file}
            color="primary"
            onClick={() => {
              file &&
                onSubmit({
                  rate_data_csv: file,
                  rate_plan: id,
                });
            }}
          >
            Upload
          </Button.Text>
        </Card.Actions>
      </Card>
      <input
        accept=".csv"
        className={classes.fileUpload}
        data-testid={`hidden-upload-input`}
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
    if (event.target?.files?.length) setFile(event.target.files.item(0));
    else setFile(null);
  }
};
