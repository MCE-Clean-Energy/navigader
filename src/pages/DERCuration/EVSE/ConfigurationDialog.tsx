import _ from 'lodash';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import { Button, Dialog, Grid, Progress } from 'navigader/components';
import { EVSEConfiguration } from 'navigader/types';
import { hooks, omitFalsey } from 'navigader/util';

import {
  createDERConfiguration,
  DialogContext,
  DialogProps,
  DialogState,
  IntegerField,
  NameField,
  PercentageField,
  RangeField,
} from '../common';

/** ============================ Types ===================================== */
type EVSEConfigurationDialogProps = DialogProps<EVSEConfiguration>;
type EVSEConfigurationDialogState = DialogState<EVSEConfigurationFields>;
type EVSEConfigurationFields = EVSEConfiguration['data'] & { name: string };

/** ============================ Components ================================ */
export const EVSEConfigurationDialog: React.FC<EVSEConfigurationDialogProps> = (props) => {
  const { closeDialog, open, tableRef } = props;
  const dispatch = useDispatch();

  // State
  const initialState: EVSEConfigurationDialogState = {
    creating: false,
    errors: {},
    ev_capacity: undefined,
    ev_count: undefined,
    ev_efficiency: undefined,
    ev_mpg_eq: undefined,
    ev_mpkwh: undefined,
    evse_count: undefined,
    evse_rating: undefined,
    name: undefined,
  };

  const [state, setState] = hooks.useMergeState(initialState);
  const { creating } = state;
  const canSubmit = stateIsValid(state) && !creating;

  return (
    <Dialog fullWidth open={open} onClose={closeDialog}>
      <Dialog.Title>Create EVSE Configuration</Dialog.Title>
      <Dialog.Content>
        <DialogContext.Provider value={{ setState, state }}>
          <Grid>
            <Grid.Item span={12}>
              <NameField />
            </Grid.Item>

            <Grid.Item span={6}>
              <IntegerField range="(0, Infinity)" field="ev_count" label="Number of EVs" />
            </Grid.Item>
            <Grid.Item span={6}>
              <RangeField
                range="(0, Infinity)"
                field="ev_mpkwh"
                label={{ text: 'EV Efficiency', units: 'miles/kWh' }}
              />
            </Grid.Item>

            <Grid.Item span={6}>
              <RangeField
                range="(0, Infinity)"
                field="ev_capacity"
                label={{ text: 'EV Battery Capacity', units: 'kWh' }}
              />
            </Grid.Item>
            <Grid.Item span={6}>
              <PercentageField
                range="(0, 100]"
                field="ev_efficiency"
                label="EV Battery Efficiency"
              />
            </Grid.Item>

            <Grid.Item span={6}>
              <RangeField
                range="(0, Infinity)"
                field="ev_mpg_eq"
                label={{ text: 'MPGe', units: 'mpg' }}
              />
            </Grid.Item>
            <Grid.Item span={6}>
              <IntegerField range="(0, Infinity)" field="evse_count" label="Number of EVSEs" />
            </Grid.Item>

            <Grid.Item span={6}>
              <RangeField
                range="(0, Infinity)"
                field="evse_rating"
                label={{ text: 'EVSE Rating', units: 'kW' }}
              />
            </Grid.Item>
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
        ..._.pick(
          state,
          'ev_capacity',
          'ev_count',
          'ev_mpg_eq',
          'ev_mpkwh',
          'evse_count',
          'evse_rating',
          'name'
        ),
        der_type: 'EVSE',
        ev_efficiency: state.ev_efficiency / 100,
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
  function getEmptyFields(state: EVSEConfigurationDialogState) {
    const requiredFields: Array<keyof EVSEConfigurationDialogState> = [
      'ev_capacity',
      'ev_count',
      'ev_efficiency',
      'ev_mpg_eq',
      'ev_mpkwh',
      'evse_count',
      'evse_rating',
      'name',
    ];

    return requiredFields.filter((field) => _.isUndefined(state[field]));
  }

  function stateIsValid(
    state: EVSEConfigurationDialogState
  ): state is Required<EVSEConfigurationDialogState> {
    const noErrors = _.isEmpty(omitFalsey(state.errors));
    const hasRequiredProps = _.isEmpty(getEmptyFields(state));
    return noErrors && hasRequiredProps;
  }
};
