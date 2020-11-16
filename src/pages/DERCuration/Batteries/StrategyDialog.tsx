import _ from 'lodash';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import { Button, Dialog, Grid, Progress, Radio, Select } from 'navigader/components';
import { BatteryStrategy, CostFunction } from 'navigader/types';
import { hooks, omitFalsey } from 'navigader/util';

import {
  BooleanField,
  createDERStrategy,
  DescriptionField,
  DialogContext,
  DialogProps,
  DialogState,
  NameField,
  NonFieldError,
} from '../common';

/** ============================ Constants ================================= */
const caLaw =
  'CA law prohibits a battery from discharging to the grid if it also charges from the grid.';
const chargeDischargeText = {
  charging: 'Changing the charging source has implications for the discharging strategy. ' + caLaw,
  discharging: 'Changing the discharge strategy has implications for the charging source. ' + caLaw,
};

/** ============================ Types ===================================== */
type BatteryStrategyFields = {
  charge_from_grid: boolean;
  description: string;
  discharge_to_grid: boolean;
  cost_function: CostFunction;
  name: string;
};

type CostFunctionClass = 'ghgRate' | 'ratePlan' | 'systemProfile';
type BatteryStrategyDialogProps = DialogProps<BatteryStrategy>;
type BatteryStrategyDialogState = DialogState<BatteryStrategyFields> & {
  cost_function_class?: CostFunctionClass;
};

/** ============================ Components ================================ */
export const BatteryStrategyDialog: React.FC<BatteryStrategyDialogProps> = (props) => {
  const { closeDialog, open, tableRef } = props;
  const dispatch = useDispatch();

  // State
  const initialState: BatteryStrategyDialogState = {
    charge_from_grid: true,
    cost_function: undefined,
    cost_function_class: 'ghgRate',
    creating: false,
    description: undefined,
    discharge_to_grid: false,
    errors: {},
  };
  const [state, setState] = hooks.useMergeState(initialState);
  const {
    charge_from_grid,
    discharge_to_grid,
    cost_function,
    cost_function_class,
    creating,
  } = state;

  const canSubmit = stateIsValid(state) && !creating;

  // Organize the cost functions into sections
  const costFunctions = hooks.useCostFunctions();
  const costFunctionsOfClass = cost_function_class && costFunctions[cost_function_class];

  return (
    <Dialog fullWidth open={open} onClose={closeDialog}>
      <Dialog.Title>Create Battery Strategy</Dialog.Title>
      <Dialog.Content>
        <DialogContext.Provider value={{ setState, state }}>
          <Grid>
            <Grid.Item span={12}>
              <NameField />
            </Grid.Item>
            <Grid.Item span={6}>
              <BooleanField
                extraStateChanges={(chargeFromGrid) => {
                  // Toggle the discharging state if battery is now charging from the grid and
                  // discharging to grid
                  if (chargeFromGrid && discharge_to_grid) {
                    return { discharge_to_grid: false };
                  }
                }}
                field="charge_from_grid"
                label="Charging Source"
                infoText={chargeDischargeText.charging}
                options={{ n: 'NEM', y: 'Grid' }}
              />
            </Grid.Item>
            <Grid.Item span={6}>
              <BooleanField
                extraStateChanges={(dischargeToGrid) => {
                  // Toggle the charging state if battery is now discharging to grid and charging
                  // from grid
                  if (dischargeToGrid && charge_from_grid) {
                    return { charge_from_grid: false };
                  }
                }}
                field="discharge_to_grid"
                label="Discharging Strategy"
                infoText={chargeDischargeText.discharging}
                options={{ n: 'Offset Load', y: 'Discharge to Grid' }}
              />
            </Grid.Item>
            <Grid.Item span={5}>
              <Radio.Group
                label="Strategy class"
                onChange={updateCostFunctionClass}
                value={cost_function_class}
              >
                <Radio label="GHG Reduction" value="ghgRate" />
                <Radio label="RA Cost Reduction" value="systemProfile" />
                <Radio label="Bill Reduction" value="ratePlan" />
              </Radio.Group>
            </Grid.Item>
            <Grid.Item span={7}>
              {costFunctionsOfClass && (
                <Select
                  label="Strategy"
                  onChange={updateCostFunction}
                  options={costFunctionsOfClass}
                  renderOption="name"
                  sorted
                  value={cost_function}
                />
              )}
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
  function updateCostFunctionClass(cfClass: CostFunctionClass) {
    setState({ cost_function: undefined, cost_function_class: cfClass });
  }

  function updateCostFunction(costFunction: CostFunction) {
    setState({ cost_function: costFunction });
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

    // Attempt to create the strategy
    const relevantState = _.omit(state, 'cost_function_class', 'creating', 'errors');
    const success = await createDERStrategy(
      {
        ...relevantState,
        cost_function: _.pick(state.cost_function, ['id', 'object_type']),
        der_type: 'Battery',
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
  function getEmptyFields(state: BatteryStrategyDialogState) {
    const requiredFields: Array<keyof BatteryStrategyDialogState> = [
      'charge_from_grid',
      'cost_function',
      'discharge_to_grid',
      'name',
    ];

    return requiredFields.filter((field) => _.isUndefined(state[field]));
  }

  function stateIsValid(
    state: BatteryStrategyDialogState
  ): state is Required<BatteryStrategyDialogState> {
    const noErrors = _.isEmpty(omitFalsey(state.errors));
    const hasRequiredProps = _.isEmpty(getEmptyFields(state));
    return noErrors && hasRequiredProps;
  }
};
