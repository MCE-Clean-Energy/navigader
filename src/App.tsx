import * as React from 'react';
import { BrowserRouter as Router, Switch, Redirect, Route, RouteProps } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { getDerConfigurations, getDerStrategies } from '@nav/shared/api';
import { Alert, AppContainer, Snackbar, ThemeProvider } from '@nav/shared/components';
import * as routes from '@nav/shared/routes';
import { slices } from '@nav/shared/store';
import { userIsAuthenticated } from '@nav/shared/models/user';
import DashboardPage from './pages/Dashboard';
import LoadPage from './pages/Load';
import LoginPage from './pages/Login';
import MeterGroupPage from './pages/MeterGroup';
import UploadPage from './pages/Upload';


/** ============================ Components ================================ */
const AppSnackbar: React.FC = () => {
  const { msg, open, type } = useSelector(slices.ui.selectSnackbar);
  const dispatch = useDispatch();
  
  return (
    <Snackbar
      autoHideDuration={6000}
      onClose={handleClose}
      open={open}
    >
      {msg && type && <Alert onClose={handleClose} type={type}>{msg}</Alert>}
    </Snackbar>
  );
  
  /** ============================ Callbacks =============================== */
  function handleClose () {
    dispatch(slices.ui.closeSnackbar());
  }
};

/**
 * This is separated from the `App` component so that we can provide a different router inside
 * tests. This enables us to test that we transition from page to page successfully.
 */
export const AppRoutes: React.FC = () =>
  <ThemeProvider>
    <Switch>
      <Route path={routes.login} component={LoginPage} />
      <AuthenticatedRoute>
        <AppContainer>
          <Switch>
            <Route path={routes.meterGroup(':id')} component={MeterGroupPage} />
            <Route path={routes.load} component={LoadPage} />
            <Route path={routes.upload} component={UploadPage} />
            <Route path={routes.dashboard.base} component={DashboardPage} />
          
            {/** Route of last resort */}
            <Redirect to={routes.dashboard.base} />
          </Switch>
        </AppContainer>
      </AuthenticatedRoute>
    </Switch>
    <AppSnackbar />
  </ThemeProvider>;

/**
 * A wrapper for <Route> that redirects to the login screen if the user isn't authenticated.
 */
const AuthenticatedRoute: React.FC<RouteProps> = ({ children, ...rest }) => {
  return (
    <Route
      {...rest}
      render={({ location }) =>
        userIsAuthenticated() ? children : (
          <Redirect
            to={{
              pathname: routes.login,
              state: { from: location }
            }}
          />
        )
      }
    />
  );
};

/**
 * The application's root component. This component is not rendered by tests
 */
const App: React.FC = () => {
  const dispatch = useDispatch();
  
  // Load DER configurations
  React.useEffect(() => {
    if (!userIsAuthenticated()) return;
    // TODO: this is only loading the first page of configurations. We should load all of them
    getDerConfigurations({ include: 'data', pageSize: 100 })
      .then((derConfigurations) => {
        dispatch(
          slices.models.setModels({ derConfigurations: derConfigurations.data })
        );
      });
  });
  
  // Load DER strategies
  React.useEffect(() => {
    if (!userIsAuthenticated()) return;
    // TODO: this is only loading the first page of strategies. We should load all of them
    getDerStrategies({ include: 'data', pageSize: 100 })
      .then((derStrategies) => {
        dispatch(
          slices.models.setModels({ derStrategies: derStrategies.data })
        );
      });
  });
  
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

/** ============================ Exports =================================== */
export default App;
