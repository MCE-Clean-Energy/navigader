import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { ThemeProvider } from '@nav/shared/components';
import MeterGroup from './pages/MeterGroup';
import Landing from './pages/Landing';
import Login from './pages/Login';


/** ============================ Components ================================ */
const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <Switch>
          <Route path="/meter_group/:id" component={MeterGroup} />
          <Route path="/landing" component={Landing} />
          <Route path="/" component={Login} />
        </Switch>
      </ThemeProvider>
    </Router>
  );
};

/** ============================ Exports =================================== */
export default App;
