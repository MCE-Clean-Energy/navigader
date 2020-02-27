import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { ThemeProvider } from '@nav/shared/components';
import * as routes from '@nav/shared/routes';
import MeterGroupPage from './pages/MeterGroup';
import LoadPage from './pages/Load';
import LoginPage from './pages/Login';
import UploadPage from './pages/Upload';


/** ============================ Components ================================ */
/**
 * This is separated from the `App` component so that we can provide a different router inside
 * tests. This enables us to test that we transition from page to page successfully.
 */
export const AppRoutes: React.FC = () =>
  <ThemeProvider>
    <Switch>
      <Route path={routes.meterGroup(':id')} component={MeterGroupPage} />
      <Route path={routes.load} component={LoadPage} />
      <Route path={routes.upload} component={UploadPage} />
      <Route path={routes.login} component={LoginPage} />
    </Switch>
  </ThemeProvider>;
  
const App: React.FC = () =>
  <Router>
    <AppRoutes />
  </Router>;

/** ============================ Exports =================================== */
export default App;
