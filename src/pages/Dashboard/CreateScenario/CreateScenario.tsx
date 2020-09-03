import * as React from 'react';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';

import { Button, Flex, PageHeader, Stepper } from 'navigader/components';
import * as routes from 'navigader/routes';
import { makeStylesHook } from 'navigader/styles';
import { useDERConfigurations, useDERStrategies, useMeterGroups } from 'navigader/util/hooks';
import { DERSelection, stepPaths } from './common';
import Review from './Review';
import { SelectCustomers } from './SelectCustomers';
import SelectDERs from './SelectDERs';
import StepActions from './StepActions';


/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  stepActions: {
    marginTop: theme.spacing(1)
  },
  stepper: {
    backgroundColor: 'inherit',
    marginBottom: theme.spacing(3)
  }
}), 'CreateScenario');

/** ============================ Components ================================ */
const CreateScenarioPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const classes = useStyles();

  // Load data
  const { derConfigurations } = useDERConfigurations({ include: 'data', page: 1, page_size: 100 });
  const { derStrategies } = useDERStrategies({ include: 'data', page: 1, page_size: 100 });
  const { meterGroups } = useMeterGroups({ page: 1, page_size: 100 });

  // All state for the page is handled here
  const [selectedMeterGroupIds, setSelectedMeterGroupIds] = React.useState<string[]>([]);
  const [selectedDers, setSelectedDers] = React.useState<Partial<DERSelection>[]>([{}]);
  const [scenarioName, setScenarioName] = React.useState<string | null>(null);

  const stepLabels = ['Select DERs', 'Select Customers', 'Review'];
  const activeStep = stepPaths.includes(location.pathname)
    ? stepPaths.indexOf(location.pathname)
    : 0;

  return (
    <>
      <Flex.Container direction="column" grow>
        <PageHeader
          actions={<Button color="secondary" onClick={cancel}>Cancel</Button>}
          breadcrumbs={[
            ['Dashboard', routes.dashboard.base],
            ['Create Scenario', routes.dashboard.createScenario.review]
          ]}
          title="Create Scenario"
        />
        <Stepper activeStep={activeStep} className={classes.stepper} steps={stepLabels} />
        <Switch>
          <Route
            path={routes.dashboard.createScenario.review}
            render={() =>
              <Review
                derConfigurations={derConfigurations}
                derStrategies={derStrategies}
                meterGroups={meterGroups}
                selectedDers={selectedDers}
                selectedMeterGroupIds={selectedMeterGroupIds}
                scenarioName={scenarioName}
                updateScenarioName={setScenarioName}
              />
            }
          />
          <Route
            path={routes.dashboard.createScenario.selectCustomers}
            render={() =>
              <SelectCustomers
                meterGroups={meterGroups}
                selectedMeterGroupIds={selectedMeterGroupIds}
                updateMeterGroups={setSelectedMeterGroupIds}
              />
            }
          />
          <Route
            path={routes.dashboard.createScenario.selectDers}
            render={() =>
              <SelectDERs
                derConfigurations={derConfigurations}
                derStrategies={derStrategies}
                selectedDers={selectedDers}
                updateDerSelections={setSelectedDers}
              />
            }
          />
        </Switch>
      </Flex.Container>

      <Flex.Item className={classes.stepActions}>
        <StepActions
          activeStep={activeStep}
          meterGroups={meterGroups}
          selectedDers={selectedDers}
          selectedMeterGroupIds={selectedMeterGroupIds}
          scenarioName={scenarioName}
        />
      </Flex.Item>
    </>
  );

  /** ========================== Callbacks ================================= */
  function cancel () {
    history.push(routes.dashboard.base);
  }
};

/** ============================ Exports =================================== */
export default CreateScenarioPage;
