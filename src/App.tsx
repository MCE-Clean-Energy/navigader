import * as React from 'react';
import { BrowserRouter as Router, Switch, Redirect, Route, RouteProps } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { getDerConfigurations, getDerStrategies } from 'navigader/api';
import { Alert, AppContainer, Snackbar, ThemeProvider } from 'navigader/components';
import * as routes from 'navigader/routes';
import { slices } from 'navigader/store';
import { userIsAuthenticated } from 'navigader/models/user';
import * as pages from './pages';


/** ============================ Types ===================================== */
type UnauthenticatedRouteProps = RouteProps & Required<Pick<RouteProps, 'component'>>;

/** ============================ Components ================================ */
const AppSnackbar: React.FC = () => {
  const { duration, msg, open, type } = useSelector(slices.ui.selectSnackbar);
  const dispatch = useDispatch();

  return (
    <Snackbar autoHideDuration={duration} onClose={handleClose} open={open}>
      {msg && type && <Alert onClose={handleClose} type={type}>{msg}</Alert>}
    </Snackbar>
  );

  /** ========================== Callbacks ================================= */
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
      <UnauthenticatedRoute path={routes.login} component={pages.LoginPage} />
      <UnauthenticatedRoute path={routes.resetPassword} component={pages.ResetPasswordPage} />
      <UnauthenticatedRoute path={routes.registration.signup} component={pages.SignupPage} />
      <UnauthenticatedRoute path={routes.registration.verify} component={pages.VerifyEmailPage} />

      <RequireAuth>
        <AppContainer>
          <Switch>
            <Route path={routes.settings} component={pages.SettingsPage} />
            <Route path={routes.meterGroup(':id')} component={pages.MeterGroupPage} />
            <Route path={routes.load} component={pages.LoadPage} />
            <Route path={routes.upload} component={pages.UploadPage} />
            <Route path={routes.dashboard.base} component={pages.DashboardPage} />
            <Route path={routes.scenario.compare()} component={pages.CompareScenariosPage} />
            <Route path={routes.scenario(':id')} component={pages.ScenarioResultsPage} />
            <Route path={routes.roadmap} component={pages.RoadmapPage} />

            {/** Route of last resort */}
            <Redirect to={routes.dashboard.base} />
          </Switch>
        </AppContainer>
      </RequireAuth>
    </Switch>
    <AppSnackbar />
  </ThemeProvider>;

const UnauthenticatedRoute: React.FC<UnauthenticatedRouteProps> = ({ component, ...rest }) =>
  <Route
    {...rest}
    render={props =>
      userIsAuthenticated()
        ? <Redirect to={{ pathname: routes.dashboard.base, state: { from: props.location } }} />
        : React.createElement(component, props)
    }
  />;

const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) =>
  userIsAuthenticated()
    ? children
    : <Redirect to={routes.login} />;

/**
 * The application's root component. This component is not rendered by tests
 */
const App: React.FC = () => {
  const dispatch = useDispatch();

  // Load DER configurations
  React.useEffect(() => {
    if (!userIsAuthenticated()) return;
    // TODO: this is only loading the first page of configurations. We should load all of them
    getDerConfigurations({ include: 'data', page: 1, page_size: 100 })
      .then((derConfigurations) => {
        dispatch(
          slices.models.updateModels(derConfigurations.data)
        );
      });
  });

  // Load DER strategies
  React.useEffect(() => {
    if (!userIsAuthenticated()) return;
    // TODO: this is only loading the first page of strategies. We should load all of them
    getDerStrategies({ include: 'data', page: 1, page_size: 100 })
      .then((derStrategies) => {
        dispatch(
          slices.models.updateModels(derStrategies.data)
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
