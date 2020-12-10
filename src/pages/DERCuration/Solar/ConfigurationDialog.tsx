import _ from 'lodash';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import { Button, Dialog, Grid, Progress, Select } from 'navigader/components';
import { SolarConfiguration, SolarArrayType } from 'navigader/types';
import { hooks, models, omitFalsey } from 'navigader/util';

import {
  createDERConfiguration,
  DialogContext,
  DialogProps,
  DialogState,
  NameField,
  NonFieldError,
  PercentageField,
  RangeField,
  TextField,
} from '../common';

/** ============================ Types ===================================== */
type SolarConfigurationDialogProps = DialogProps<SolarConfiguration>;
type SolarConfigurationDialogState = DialogState<SolarConfigurationFields>;
type SolarConfigurationFields = SolarConfiguration['data'] & { name: string };

/** ============================ Components ================================ */
export const SolarConfigurationDialog: React.FC<SolarConfigurationDialogProps> = (props) => {
  const { closeDialog, open, tableRef } = props;
  const dispatch = useDispatch();

  // State
  const initialState: SolarConfigurationDialogState = {
    address: undefined,
    array_type: 1,
    azimuth: 180,
    creating: false,
    errors: {},
    name: undefined,
    tilt: 7,
  };

  const [state, setState] = hooks.useMergeState(initialState);
  const { array_type, creating } = state;
  const canSubmit = stateIsValid(state) && !creating;

  return (
    <Dialog fullWidth open={open} onClose={closeDialog}>
      <Dialog.Title>Create Solar Configuration</Dialog.Title>
      <Dialog.Content>
        <DialogContext.Provider value={{ setState, state }}>
          <Grid>
            <Grid.Item span={12}>
              <NameField />
            </Grid.Item>

            <Grid.Item span={6}>
              <TextField field="address" label="ZIP Code" required />
            </Grid.Item>
            <Grid.Item span={6}>
              <Select
                label="Array Type"
                onChange={updateArrayType}
                options={[1, 0]}
                renderOption={models.der.renderSolarArrayType}
                value={array_type}
              />
            </Grid.Item>

            <Grid.Item span={6}>
              <RangeField
                range="[0, 360)"
                field="azimuth"
                label={{ text: 'Azimuth Angle', units: 'degrees' }}
              />
            </Grid.Item>
            <Grid.Item span={6}>
              <RangeField
                range="[0, 90]"
                field="tilt"
                label={{ text: 'Tilt Angle', units: 'degrees' }}
              />
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
    </Dialog>
  );

  /** ========================== Callbacks ================================= */
  function updateArrayType(arrayType: SolarArrayType) {
    setState({ array_type: arrayType });
  }

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

    // Attempt to create the configuration
    const success = await createDERConfiguration(
      {
        ..._.pick(state, 'address', 'array_type', 'azimuth', 'name', 'tilt'),
        der_type: 'SolarPV',
      },
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

  /** ========================== Helpers =================================== */
  function getEmptyFields(state: SolarConfigurationDialogState) {
    const requiredFields: Array<keyof SolarConfigurationDialogState> = [
      'address',
      'azimuth',
      'name',
      'tilt',
    ];

    return requiredFields.filter((field) => _.isUndefined(state[field]));
  }

  function stateIsValid(
    state: SolarConfigurationDialogState
  ): state is Required<SolarConfigurationDialogState> {
    const noErrors = _.isEmpty(omitFalsey(state.errors));
    const hasRequiredProps = _.isEmpty(getEmptyFields(state));
    return noErrors && hasRequiredProps;
  }
};
