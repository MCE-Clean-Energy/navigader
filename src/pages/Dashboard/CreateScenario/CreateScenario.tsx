import * as React from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';

import { Button, Flex, PageHeader, Stepper } from 'navigader/components';
import { routes, useRouter } from 'navigader/routes';
import { makeStylesHook } from 'navigader/styles';
import { hooks } from 'navigader/util';
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
  const routeTo = useRouter();
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
  function updateState(newState: Partial<CreateScenarioState>) {
    setState({ ...state, ...newState });
  }
};

/** ============================ Exports =================================== */
export default CreateScenarioPage;
