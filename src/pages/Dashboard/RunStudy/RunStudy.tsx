import React from 'react';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';

import { getMeterGroups } from '@nav/shared/api';
import { Button, Flex, PageHeader, Stepper } from '@nav/shared/components';
import { MeterGroup } from '@nav/shared/models/meter';
import * as routes from '@nav/shared/routes';
import { makeStylesHook } from '@nav/shared/styles';
import { makeCancelableAsync } from '@nav/shared/util';
import Review from './Review';
import SelectCustomers from './SelectCustomers';
import SelectDERs from './SelectDERs';
import StepActions from './StepActions';
import { stepPaths } from './util';


/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
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
          title="Run Study"
        />
        <Stepper activeStep={activeStep} className={classes.stepper} steps={stepLabels} />
        <Switch>
          <Route
            path={routes.dashboard.runStudy.review}
            render={() => <Review meterGroups={meterGroups} />}
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
          <Route path={routes.dashboard.runStudy.selectDers} component={SelectDERs} />
        </Switch>
      </Flex.Container>
      
      <Flex.Item>
        <StepActions activeStep={activeStep} />
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
