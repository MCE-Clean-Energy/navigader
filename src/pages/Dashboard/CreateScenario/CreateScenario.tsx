import _ from 'lodash';
import { DateTime } from 'luxon';
import * as React from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';

import { Button, Flex, PageHeader, Stepper } from 'navigader/components';
import { routes, usePushRouter } from 'navigader/routes';
import { makeStylesHook } from 'navigader/styles';
import { Nullable } from 'navigader/types';
import { hooks, interval } from 'navigader/util';
import { CreateScenarioState, stepPaths } from './common';
import { Review } from './Review';
import { SelectCostFunctions } from './SelectCostFunctions';
import { SelectCustomers } from './SelectCustomers';
import { SelectDERs } from './SelectDERs';
import { StepActions } from './StepActions';

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(
  (theme) => ({
    stepActions: {
      marginTop: theme.spacing(3),
    },
    stepper: {
      backgroundColor: 'inherit',
      marginBottom: theme.spacing(3),
    },
  }),
  'CreateScenario'
);

/** ============================ Components ================================ */
const CreateScenarioPage: React.FC = () => {
  const routeTo = usePushRouter();
  const location = useLocation();
  const classes = useStyles();

  // Load data
  const derConfigurations = hooks.useDERConfigurations({ include: 'data', page: 0, pageSize: 100 });
  const costFunctions = hooks.useCostFunctions({ ratePlans: { include: ['rate_collections.*'] } });
  const derStrategies = hooks.useDERStrategies({ include: 'data', page: 0, pageSize: 100 });
  const originFiles = hooks.useOriginFiles({ page: 0, pageSize: 100 });
  const scenarios = hooks.useScenarios({
    include: ['ders', 'meter_group', 'report_summary'],
    page: 0,
    pageSize: 100,
  });

  // All state for the page is handled here
  const [state, setState] = React.useState<CreateScenarioState>({
    costFunctionSelections: {},
    derSelections: [{}],
    originFileSelections: [],
    name: null,
    scenarioSelections: [],
    startDate: null,
  });

  const stepLabels = ['Select Customers', 'Select DERs', 'Select Cost Functions', 'Review'];
  const activeStep = stepPaths.includes(location.pathname)
    ? stepPaths.indexOf(location.pathname)
    : 0;

  const screenProps = {
    // Data props
    costFunctions,
    derConfigurations,
    derStrategies,
    originFiles,
    scenarios,

    // State props
    state,
    updateState,
  };

  return (
    <>
      <Flex.Container direction="column" grow>
        <PageHeader
          actions={
            <Button color="secondary" onClick={routeTo.dashboard.base}>
              Cancel
            </Button>
          }
          breadcrumbs={[
            ['Dashboard', routes.dashboard.base],
            ['Create Scenario', routes.dashboard.createScenario.review],
          ]}
          title="Create Scenario"
        />
        <Stepper activeStep={activeStep} className={classes.stepper} steps={stepLabels} />
        <Switch>
          <Route
            path={routes.dashboard.createScenario.review}
            render={() => <Review {...screenProps} />}
          />
          <Route
            path={routes.dashboard.createScenario.selectCostFunctions}
            render={() => <SelectCostFunctions {...screenProps} />}
          />
          <Route
            path={routes.dashboard.createScenario.selectCustomers}
            render={() => <SelectCustomers {...screenProps} />}
          />
          <Route
            path={routes.dashboard.createScenario.selectDers}
            render={() => <SelectDERs {...screenProps} />}
          />
          <Redirect to={routes.dashboard.createScenario.selectCustomers} />
        </Switch>
      </Flex.Container>

      <Flex.Item className={classes.stepActions}>
        <StepActions activeStep={activeStep} {...screenProps} />
      </Flex.Item>
    </>
  );

  /** ========================== Callbacks ================================= */
  function updateState(
    stateUpdates: Partial<CreateScenarioState>,
    startDate: Nullable<DateTime> = null
  ) {
    const newState = { ...state, ...stateUpdates };
    const { originFileSelections, scenarioSelections } = newState;
    const noCustomerSegments = _.isEmpty(originFileSelections) && _.isEmpty(scenarioSelections);

    // Update the startDate if (a) there are no selected customer segments, or (b) no date is set
    if (noCustomerSegments) newState.startDate = null;
    else if (_.isNull(state.startDate) && !_.isNull(startDate)) {
      newState.startDate = startDate;

      // If the new start date is non-null, we need to unset any cost functions that may have been
      // selected with a different year
      newState.costFunctionSelections = updateCostFunctionSelections(newState);
    }

    setState(newState);
  }

  /** ========================== Helpers =================================== */
  /**
   * Returns an updated set of cost function selections, removing all selections that are
   * incompatible with the startDate. GHG rates are always OK.
   *
   * @param {CreateScenarioState} state: the state of scenario creation
   */
  function updateCostFunctionSelections(
    state: CreateScenarioState
  ): CreateScenarioState['costFunctionSelections'] {
    const { costFunctionSelections, startDate } = state;

    // If there's no start date, no selections are invalid
    if (_.isNull(startDate)) return costFunctionSelections;

    // Iterate through the selections and retain the ones that are valid
    const { caisoRate, ratePlan, systemProfile } = costFunctionSelections;
    const newSelections = { ...costFunctionSelections };

    // Procurement rate selection must match year
    if (caisoRate) {
      const rate = _.find(costFunctions.caisoRate, ['id', caisoRate]);
      if (!interval.hasYear(rate, startDate)) delete newSelections.caisoRate;
    }

    // Rate plan start date must precede meter data start date
    if (ratePlan && ratePlan !== 'auto') {
      const rate = _.find(costFunctions.ratePlan, ['id', ratePlan]);
      if (!rate || _.isNull(rate.start_date) || startDate < rate.start_date) {
        delete newSelections.ratePlan;
      }
    }

    // System profile selection must match year
    if (systemProfile) {
      const rate = _.find(costFunctions.systemProfile, ['id', systemProfile]);
      if (!interval.hasYear(rate, startDate)) delete newSelections.systemProfile;
    }

    return newSelections;
  }
};

/** ============================ Exports =================================== */
export default CreateScenarioPage;
