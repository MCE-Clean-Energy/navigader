import React from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';

import { Button, PageHeader } from '@nav/shared/components';
import * as routes from '@nav/shared/routes';
import RunStudy from './RunStudy'


/** ============================ Components ================================ */
const DashboardPage: React.FC = () => {
  const history = useHistory();
  return (
    <PageHeader
      actions={<Button color="secondary" onClick={runStudy}>Run Study</Button>}
      title="Dashboard"
    />
  );
  
  /** ============================ Callbacks =============================== */
  function runStudy () {
    history.push(routes.dashboard.runStudy.selectCustomers);
  }
};

const DashboardRouter = () =>
  <Switch>
    <Route path={routes.dashboard.runStudy.base} component={RunStudy} />
    <Route exact path={routes.dashboard.base} component={DashboardPage} />
  </Switch>;

/** ============================ Exports =================================== */
export default DashboardRouter;
