import _ from 'lodash';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import { Button, Dialog, Grid, Progress } from 'navigader/components';
import { BatteryConfiguration } from 'navigader/types';
import { hooks, omitFalsey } from 'navigader/util';

import {
  createDERConfiguration,
  DialogContext,
  DialogProps,
  DialogState,
  IntegerField,
  NameField,
  NonFieldError,
  PercentageField,
  RangeField,
} from '../common';

/** ============================ Types ===================================== */
type BatteryConfigurationDialogProps = DialogProps<BatteryConfiguration>;
type BatteryConfigurationDialogState = DialogState<BatteryConfigurationFields>;
type BatteryConfigurationFields = BatteryConfiguration['data'] & { name: string };

/** ============================ Components ================================ */
export const BatteryConfigurationDialog: React.FC<BatteryConfigurationDialogProps> = (props) => {
  const { closeDialog, open, tableRef } = props;
  const dispatch = useDispatch();

  const initialState = {
    creating: false,
    discharge_duration_hours: undefined,
    efficiency: undefined,
    errors: {},
    name: undefined,
    rating: undefined,
  };

  const [state, setState] = hooks.useMergeState<BatteryConfigurationDialogState>(initialState);
  const { creating } = state;
  const canSubmit = stateIsValid(state) && !creating;

  return (
    <Dialog fullWidth open={open} onClose={closeDialog}>
      <Dialog.Title>Create Battery Configuration</Dialog.Title>
      <Dialog.Content>
        <DialogContext.Provider value={{ setState, state }}>
          <Grid>
            <Grid.Item span={12}>
              <NameField />
            </Grid.Item>

            <Grid.Item span={6}>
              <IntegerField
                field="discharge_duration_hours"
                label={{ text: 'Discharge Duration', units: 'hours' }}
                range="[0, Infinity]"
              />
            </Grid.Item>

            <Grid.Item span={6}>
              <RangeField
                field="rating"
                label={{ text: 'Rating', units: 'kW' }}
                range="[0, Infinity)"
              />
            </Grid.Item>

            <Grid.Item span={12}>
              <PercentageField field="efficiency" label="Efficiency" range="(0, 100]" />
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
        ..._.pick(state, 'discharge_duration_hours', 'name', 'rating'),
        der_type: 'Battery',
        efficiency: state.efficiency / 100,
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
  function getEmptyFields(state: BatteryConfigurationDialogState) {
    const requiredFields: Array<keyof BatteryConfigurationDialogState> = [
      'discharge_duration_hours',
      'efficiency',
      'name',
      'rating',
    ];

    return requiredFields.filter((field) => _.isUndefined(state[field]));
  }

  function stateIsValid(
    state: BatteryConfigurationDialogState
  ): state is Required<BatteryConfigurationDialogState> {
    const noErrors = _.isEmpty(omitFalsey(state.errors));
    const hasRequiredProps = _.isEmpty(getEmptyFields(state));
    return noErrors && hasRequiredProps;
  }
};
