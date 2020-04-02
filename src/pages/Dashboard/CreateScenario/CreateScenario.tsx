import * as React from 'react';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { getMeterGroups } from '@nav/shared/api';
import { Button, Flex, PageHeader, Stepper } from '@nav/shared/components';
import { MeterGroup } from '@nav/shared/models/meter';
import * as routes from '@nav/shared/routes';
import { slices } from '@nav/shared/store';
import { makeStylesHook } from '@nav/shared/styles';
import { makeCancelableAsync } from '@nav/shared/util';
import Review from './Review';
import SelectCustomers from './SelectCustomers';
import SelectDERs from './SelectDERs';
import { DERSelection, stepPaths } from './shared';
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
}));

/** ============================ Components ================================ */
const CreateScenarioPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const classes = useStyles();
  const derConfigurations = useSelector(slices.models.selectModels('derConfigurations'));
  const derStrategies = useSelector(slices.models.selectModels('derStrategies'));
  
  // All state for the page is handled here
  const [meterGroups, setMeterGroups] = React.useState<MeterGroup[] | null>(null);
  const [selectedMeterGroupIds, setSelectedMeterGroupIds] = React.useState<string[]>([]);
  const [selectedDers, setSelectedDers] = React.useState<Partial<DERSelection>[]>([{}]);
  const [scenarioName, setScenarioName] = React.useState<string | null>(null);
  
  // Load meter groups
  React.useEffect(makeCancelableAsync(
    () => getMeterGroups(),
    res => setMeterGroups(res.data)
  ), []);
  
  const stepLabels = ['Select DERs', 'Select Customers', 'Review'];
  const activeStep = stepPaths.includes(location.pathname)
    ? stepPaths.indexOf(location.pathname)
    : 0;
  
  return (
    <>
      <Flex.Container direction="column" grow>
        <PageHeader
          actions={<Button color="secondary" onClick={cancel}>Cancel</Button>}
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
  
  /** ============================ Callbacks =============================== */
  function cancel () {
    history.push(routes.dashboard.base);
  }
};

/** ============================ Exports =================================== */
export default CreateScenarioPage;
