import _ from 'lodash';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import { Button, Dialog, Grid, Link, Progress } from 'navigader/components';
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
    ev_count: undefined,
    ev_mpkwh: 3.3,
    evse_count: undefined,
    evse_rating: undefined,
    evse_utilization: 80,
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
                infoText={
                  <div>
                    Number of miles EV can travel on a single kWh of charge. Various sources
                    estimate the average EV's kWh/mile value to be between 2.9 and 3.5.
                    <Link.SourceList
                      color="secondary"
                      sources={[
                        'https://www.greencarreports.com/news/1082737_electric-car-efficiency-forget-mpge-it-should-be-miles-kwh',
                        'https://afdc.energy.gov/fuels/electricity_charging_home.html',
                        'https://www.vivintsolar.com/blog/how-much-does-it-cost-to-charge-an-electric-car',
                      ]}
                    />{' '}
                    For a break down of efficiency by car type, see{' '}
                    <Link.NewTab
                      color="secondary"
                      to="https://www.corporatemonkeycpa.com/2017/12/09/how-to-calculate-your-ev-cost-per-mile/?cn-reloaded=1"
                    >
                      this article.
                    </Link.NewTab>
                  </div>
                }
                label={{ text: 'EV Efficiency', units: 'miles/kWh' }}
              />
            </Grid.Item>

            <Grid.Item span={6}>
              <IntegerField range="(0, Infinity)" field="evse_count" label="Number of Ports" />
            </Grid.Item>
            <Grid.Item span={6}>
              <RangeField
                range="(0, Infinity)"
                field="evse_rating"
                infoText={`
                  Level 1 chargers use 120 Volts AC, 1.9 kW maximum power. Level 2 chargers use 
                  208 - 240 Volts AC, and can deliver up to 19.2 kW, however most residential Level 
                  2 equipment operate at lower power, delivering about 7.2kW.
                `}
                label={{ text: 'EVSE Rating', units: 'kW' }}
              />
            </Grid.Item>

            <Grid.Item span={6}>
              <PercentageField
                range="(0, 100]"
                infoText="Studies consistently point to 80% of EV charging at residences."
                field="evse_utilization"
                label="EVSE Utilization"
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
        ..._.pick(state, 'ev_count', 'ev_mpkwh', 'evse_count', 'evse_rating', 'name'),
        der_type: 'EVSE',
        evse_utilization: state.evse_utilization / 100,
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
      'ev_count',
      'ev_mpkwh',
      'evse_count',
      'evse_rating',
      'evse_utilization',
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
