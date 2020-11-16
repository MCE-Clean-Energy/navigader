import _ from 'lodash';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import { Button, Dialog, Grid, Progress } from 'navigader/components';
import { EVSEStrategy } from 'navigader/types';
import { hooks, omitFalsey } from 'navigader/util';

import {
  BooleanField,
  createDERStrategy,
  DescriptionField,
  DialogContext,
  DialogProps,
  DialogState,
  IntegerField,
  NameField,
  NonFieldError,
  RangeField,
} from '../common';

/** ============================ Types ===================================== */
type EVSEStrategyFields = {
  charge_off_nem: boolean;
  description: string;
  distance: number;
  drive_home_hour: number;
  drive_in_hour: number;
  name: string;
};

type EVSEStrategyDialogProps = DialogProps<EVSEStrategy>;
type EVSEStrategyDialogState = DialogState<EVSEStrategyFields>;

/** ============================ Components ================================ */
export const EVSEStrategyDialog: React.FC<EVSEStrategyDialogProps> = (props) => {
  const { closeDialog, open, tableRef } = props;
  const dispatch = useDispatch();

  // State
  const initialState: EVSEStrategyDialogState = {
    charge_off_nem: false,
    creating: false,
    description: undefined,
    distance: undefined,
    drive_home_hour: undefined,
    drive_in_hour: undefined,
    errors: {},
  };

  const [state, setState] = hooks.useMergeState(initialState);
  const { creating } = state;
  const canSubmit = stateIsValid(state) && !creating;

  return (
    <Dialog fullWidth open={open} onClose={closeDialog}>
      <Dialog.Title>Create EVSE Strategy</Dialog.Title>
      <Dialog.Content>
        <DialogContext.Provider value={{ setState, state }}>
          <Grid>
            <Grid.Item span={12}>
              <NameField />
            </Grid.Item>
            <Grid.Item span={6}>
              <BooleanField
                field="charge_off_nem"
                label="Charging Source"
                options={{ n: 'Grid', y: 'NEM' }}
              />
            </Grid.Item>
            <Grid.Item span={6}>
              <RangeField
                range="(0, Infinity)"
                field="distance"
                infoText="Represents the number of miles the drivers commute one-way"
                label="Distance"
              />
            </Grid.Item>

            <Grid.Item span={12}>
              Driving hours represent the hour of the day the drivers commute to and from work. They
              are numerical representations of the 24-hour clock: 0 to 11 means 12am to 11am, while
              12 to 23 means 12pm to 11pm.
            </Grid.Item>

            <Grid.Item span={6}>
              <IntegerField range="[0, 23]" field="drive_in_hour" label="Drive to Work Hour" />
            </Grid.Item>
            <Grid.Item span={6}>
              <IntegerField range="[0, 23]" field="drive_home_hour" label="Drive Home Hour" />
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
    const relevantState = _.omit(state, 'cost_function_class', 'creating', 'errors');
    const success = await createDERStrategy(
      { ...relevantState, der_type: 'EVSE' },
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
  function getEmptyFields(state: EVSEStrategyDialogState) {
    const requiredFields: Array<keyof EVSEStrategyDialogState> = [
      'charge_off_nem',
      'drive_home_hour',
      'drive_in_hour',
      'name',
    ];

    return requiredFields.filter((field) => _.isUndefined(state[field]));
  }

  function stateIsValid(
    state: EVSEStrategyDialogState
  ): state is Required<EVSEStrategyDialogState> {
    const noErrors = _.isEmpty(omitFalsey(state.errors));
    const hasRequiredProps = _.isEmpty(getEmptyFields(state));
    return noErrors && hasRequiredProps;
  }
};
