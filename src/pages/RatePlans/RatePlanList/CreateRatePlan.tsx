import * as React from "react";

import { Dialog, Button, TextField, Select, Grid } from "navigader/components";
import { CreateRatePlanParams } from "navigader/api";

/* ================================= Types ================================= */
type CreateRatePlanProps = {
  onSubmit: (params: CreateRatePlanParams) => void;
};

export const CreateRatePlan: React.FC<CreateRatePlanProps> = (props) => {
  let [dialogOpen, setDialogOpen] = React.useState(false);
  let [name, updateName] = React.useState<string>("");
  let [sector, updateSector] = React.useState<string>("Residential");
  const { onSubmit } = props;

  return (
    <>
      <Button.Fab
        name={"plus"}
        color="primary"
        onClick={() => setDialogOpen(true)}
      ></Button.Fab>
      <Dialog
        fullWidth
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
      >
        <Dialog.Title>Create Rate Plan</Dialog.Title>
        <Dialog.Content>
          <Grid>
            <Grid.Item span={12}>
              <TextField
                autoFocus
                id="name"
                label="Rate Plan Name"
                onChange={updateName}
                value={name}
              />
            </Grid.Item>
            <Grid.Item span={12}>
              <Select
                label="Sector"
                onChange={updateSector}
                options={[
                  "Commercial",
                  "Residential",
                  "Industrial",
                  "Agricultural",
                  "Lighting",
                ]}
                value={sector}
              />
            </Grid.Item>
          </Grid>
        </Dialog.Content>
        <Dialog.Actions>
          <Button.Text
            onClick={() => {
              setDialogOpen(false);
            }}
          >
            Cancel
          </Button.Text>
          <Button.Text
            color="primary"
            disabled={!name.length}
            onClick={() => {
              onSubmit({ name, sector });
              setDialogOpen(false);
            }}
          >
            Submit
          </Button.Text>
        </Dialog.Actions>
      </Dialog>
    </>
  );
};
