import _ from 'lodash';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import { Button, Dialog, Grid, Progress } from 'navigader/components';
import { SolarStrategy } from 'navigader/types';
import { hooks, omitFalsey } from 'navigader/util';

import {
  createDERStrategy,
  DescriptionField,
  DialogContext,
  DialogProps,
  DialogState,
  NameField,
  NonFieldError,
  PercentageField,
} from '../common';

/** ============================ Types ===================================== */
type SolarStrategyDialogProps = DialogProps<SolarStrategy>;
type SolarStrategyDialogState = DialogState<SolarStrategyFields>;
type SolarStrategyFields = {
  description: string;
  name: string;
  serviceable_load_ratio: number;
};

/** ============================ Components ================================ */
export const SolarStrategyDialog: React.FC<SolarStrategyDialogProps> = (props) => {
  const { closeDialog, open, tableRef } = props;
  const dispatch = useDispatch();

  // State
  const initialState: SolarStrategyDialogState = {
    creating: false,
    description: undefined,
    errors: {},
    name: undefined,
    serviceable_load_ratio: undefined,
  };

  const [state, setState] = hooks.useMergeState(initialState);
  const { creating } = state;
  const canSubmit = stateIsValid(state) && !creating;

  return (
    <Dialog fullWidth open={open} onClose={closeDialog}>
      <Dialog.Title>Create Solar Strategy</Dialog.Title>
      <Dialog.Content>
        <DialogContext.Provider value={{ setState, state }}>
          <Grid>
            <Grid.Item span={12}>
              <NameField />
            </Grid.Item>
            <Grid.Item span={12}>
              <PercentageField
                field="serviceable_load_ratio"
                label="Serviceable Load Ratio"
                range="(0, Infinity]"
              />
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
    const relevantState = _.omit(state, 'creating', 'errors');
    const success = await createDERStrategy(
      {
        ...relevantState,
        der_type: 'SolarPV',
        serviceable_load_ratio: state.serviceable_load_ratio / 100,
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
  function getEmptyFields(state: SolarStrategyDialogState) {
    const requiredFields: Array<keyof SolarStrategyDialogState> = [
      'name',
      'serviceable_load_ratio',
    ];

    return requiredFields.filter((field) => _.isUndefined(state[field]));
  }

  function stateIsValid(
    state: SolarStrategyDialogState
  ): state is Required<SolarStrategyDialogState> {
    const noErrors = _.isEmpty(omitFalsey(state.errors));
    const hasRequiredProps = _.isEmpty(getEmptyFields(state));
    return noErrors && hasRequiredProps;
  }
};
