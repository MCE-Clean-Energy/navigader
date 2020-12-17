import _ from 'lodash';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import { Alert, Button, Dialog, Grid, Link, Progress } from 'navigader/components';
import { makeStylesHook } from 'navigader/styles';
import { FuelSwitchingStrategy } from 'navigader/types';
import { hooks, omitFalsey } from 'navigader/util';

import {
  createDERStrategy,
  DescriptionField,
  DialogContext,
  DialogProps,
  DialogState,
  NameField,
  NonFieldError,
} from '../common';

/** ============================ Types ===================================== */
const OPEN_EI_DATASET = 'https://openei.org/datasets/files/961/pub/';
const OPEN_EI_COVER_PAGE =
  'https://openei.org/datasets/dataset/commercial-and-residential-hourly-load-profiles-for-all-tmy3-locations-in-the-united-states';

/** ============================ Types ===================================== */
type FuelSwitchingStrategyDialogProps = DialogProps<FuelSwitchingStrategy>;
type FuelSwitchingStrategyDialogState = DialogState<FuelSwitchingStrategyFields>;
type FuelSwitchingStrategyFields = {
  description: string;
  name: string;
  file: File;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(
  (theme) => ({
    alert: { marginBottom: theme.spacing(2) },
    fileUpload: { display: 'none' },
    submitButton: { float: 'right' },
  }),
  'CreateFuelSwitchingStrategy'
);

/** ============================ Components ================================ */
export const FuelSwitchingStrategyDialog: React.FC<FuelSwitchingStrategyDialogProps> = (props) => {
  const { closeDialog, open, tableRef } = props;
  const classes = useStyles();
  const dispatch = useDispatch();

  // State
  const initialState: FuelSwitchingStrategyDialogState = {
    creating: false,
    description: '',
    errors: {},
    name: undefined,
    file: undefined,
  };

  const [state, setState] = hooks.useMergeState(initialState);
  const { creating } = state;
  const canSubmit = stateIsValid(state) && !creating;
  const fileUpload = React.useRef<HTMLInputElement>(null);

  return (
    <Dialog fullWidth open={open} onClose={closeDialog}>
      <Dialog.Title>Create Fuel Switching Strategy</Dialog.Title>
      <Dialog.Content>
        <Alert className={classes.alert} type="info">
          To create a Fuel Switching strategy, please download an{' '}
          <Link.NewTab to={OPEN_EI_COVER_PAGE} useAnchor>
            Hourly Load Profile
          </Link.NewTab>{' '}
          from OpenEI and upload it to NavigaDER. Files are available to browse{' '}
          <Link.NewTab to={OPEN_EI_DATASET} useAnchor>
            here.
          </Link.NewTab>
        </Alert>
        <DialogContext.Provider value={{ setState, state }}>
          <Grid>
            <Grid.Item span={6}>
              <Button color="secondary" onClick={openFileSelector}>
                Select File
              </Button>
            </Grid.Item>
            <Grid.Item span={12}>
              <NameField />
            </Grid.Item>
            <Grid.Item span={12}>
              <DescriptionField />
            </Grid.Item>

            <NonFieldError />
          </Grid>
        </DialogContext.Provider>
      </Dialog.Content>
      {creating && <Progress />}
      <Dialog.Actions>
        <Button.Text onClick={cancel}>Cancel</Button.Text>
        <Button.Text color="primary" disabled={!canSubmit} onClick={create}>
          Create
        </Button.Text>
      </Dialog.Actions>
      <input
        accept=".csv"
        className={classes.fileUpload}
        onChange={onFileChange}
        ref={fileUpload}
        type="file"
      />
    </Dialog>
  );

  /** ========================== Callbacks ================================= */
  function cancel() {
    closeDialog();

    // Reset errors for empty fields so the dialog is cleaner when re-opened
    const emptyFields = getEmptyFields(state);
    setState({
      errors: {
        ...state.errors,
        ...Object.fromEntries(emptyFields.map((field) => [field, undefined])),
      },
    });
  }

  async function create() {
    // The "Create" button should not allow submitting unless the state is valid, so this validation
    // is redundant but also solves type-checking issues.
    if (!stateIsValid(state)) return;

    // Attempt to create the strategy
    const relevantState = _.omit(state, 'creating', 'errors');

    const success = await createDERStrategy(
      { ...relevantState, der_type: 'FuelSwitching' },
      setState,
      dispatch
    );

    // If the request failed, return
    if (!success) return;

    // Otherwise close the dialog, re-fetch the table and reset the state
    closeDialog();
    tableRef.current?.fetch();
    setState(initialState);
  }

  function openFileSelector() {
    fileUpload.current?.click();
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target?.files?.item(0) || undefined;
    setState({ file, name: file?.name.split('.csv')[0] || '' });
  }

  /** ========================== Helpers =================================== */
  function getEmptyFields(state: FuelSwitchingStrategyDialogState) {
    const requiredFields: Array<keyof FuelSwitchingStrategyDialogState> = ['name', 'file'];

    return requiredFields.filter((field) => _.isUndefined(state[field]));
  }

  function stateIsValid(
    state: FuelSwitchingStrategyDialogState
  ): state is Required<FuelSwitchingStrategyDialogState> {
    const noErrors = _.isEmpty(omitFalsey(state.errors));
    const hasRequiredProps = _.isEmpty(getEmptyFields(state));
    return noErrors && hasRequiredProps;
  }
};
