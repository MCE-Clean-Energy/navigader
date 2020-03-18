import * as React from 'react';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';

import { getDerConfigurations, getDerStrategies, getMeterGroups } from '@nav/shared/api';
import { Button, Flex, PageHeader, Stepper } from '@nav/shared/components';
import { BatteryConfiguration, BatteryStrategy } from '@nav/shared/models/der';
import { MeterGroup } from '@nav/shared/models/meter';
import * as routes from '@nav/shared/routes';
import { makeStylesHook } from '@nav/shared/styles';
import { makeCancelableAsync } from '@nav/shared/util';
import Review from './Review';
import SelectCustomers from './SelectCustomers';
import SelectDERs from './SelectDERs';
import StepActions from './StepActions';
import { DERSelection, stepPaths } from './shared';


/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  stepActions: {
    marginTop: theme.spacing(1)
  },
  stepper: {
    marginBottom: theme.spacing(3)
  }
}));

/** ============================ Components ================================ */
const RunStudyPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const classes = useStyles();
  
  // All state for the page is handled here
  const [meterGroups, setMeterGroups] = React.useState<MeterGroup[] | null>(null);
  const [selectedMeterGroupIds, setSelectedMeterGroupIds] = React.useState<string[]>([]);
  const [selectedDers, setSelectedDers] = React.useState<Partial<DERSelection>[]>([{}]);
  const [derConfigurations, setDERConfigurations] = React.useState<BatteryConfiguration[]>([]);
  const [derStrategies, setDERStrategies] = React.useState<BatteryStrategy[]>([]);
  const [studyName, setStudyName] = React.useState<string | null>(null);
  
  // Load meter groups
  React.useEffect(makeCancelableAsync(
    () => getMeterGroups(),
    res => setMeterGroups(res.data)
  ), []);
  
  // Load DER configurations
  React.useEffect(makeCancelableAsync(
    () => getDerConfigurations({ data: true }),
    res => setDERConfigurations(res.data)
  ), []);
  
  // Load DER strategies
  React.useEffect(makeCancelableAsync(
    () => getDerStrategies({ data: true }),
    res => setDERStrategies(res.data)
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
          title="Run Study"
        />
        <Stepper activeStep={activeStep} className={classes.stepper} steps={stepLabels} />
        <Switch>
          <Route
            path={routes.dashboard.runStudy.review}
            render={() =>
              <Review
                derConfigurations={derConfigurations}
                derStrategies={derStrategies}
                meterGroups={meterGroups}
                selectedDers={selectedDers}
                selectedMeterGroupIds={selectedMeterGroupIds}
                studyName={studyName}
                updateStudyName={setStudyName}
              />
            }
          />
          <Route
            path={routes.dashboard.runStudy.selectCustomers}
            render={() =>
              <SelectCustomers
                meterGroups={meterGroups}
                selectedMeterGroupIds={selectedMeterGroupIds}
                updateMeterGroups={setSelectedMeterGroupIds}
              />
            }
          />
          <Route
            path={routes.dashboard.runStudy.selectDers}
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
          studyName={studyName}
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
export default RunStudyPage;
