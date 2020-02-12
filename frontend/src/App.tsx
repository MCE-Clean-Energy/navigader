import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { ThemeProvider } from '@nav/shared/components';
import MeterGroup from './pages/MeterGroup';
import Landing from './pages/Landing';
import Login from './pages/Login';


/** ============================ Components ================================ */
/**
 * This is separated from the `App` component so that we can provide a different router inside
 * tests. This enables us to test that we transition from page to page successfully.
 */
export const AppRoutes: React.FC = () =>
  <ThemeProvider>
    <Switch>
      <Route path="/meter_group/:id" component={MeterGroup} />
      <Route path="/landing" component={Landing} />
      <Route path="/" component={Login} />
    </Switch>
  </ThemeProvider>;
  
const App: React.FC = () =>
  <Router>
    <AppRoutes />
  </Router>;

/** ============================ Exports =================================== */
export default App;
