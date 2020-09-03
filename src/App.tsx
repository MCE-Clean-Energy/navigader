import * as React from 'react';
import { BrowserRouter as Router, Switch, Redirect, Route, RouteProps } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { AlertSnackbar, AppContainer, ThemeProvider } from 'navigader/components';
import * as routes from 'navigader/routes';
import { slices } from 'navigader/store';
import { userIsAuthenticated } from 'navigader/models/user';
import * as pages from './pages';


/** ============================ Types ===================================== */
type UnauthenticatedRouteProps = RouteProps & Required<Pick<RouteProps, 'component'>>;

/** ============================ Components ================================ */
/**
 * This is separated from the `App` component so that we can provide a different router inside
 * tests. This enables us to test that we transition from page to page successfully.
 */
export const AppRoutes: React.FC = () => {
  const dispatch = useDispatch();
  const { duration, msg, open, type } = useSelector(slices.ui.selectSnackbar);
  return (
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

      <AlertSnackbar
        autoHideDuration={duration}
        onClose={handleClose}
        open={open}
        msg={msg}
        type={type}
      />
    </ThemeProvider>
  );

  /** ========================== Callbacks ================================= */
  function handleClose () {
    dispatch(slices.ui.closeSnackbar());
  }
};

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
const App: React.FC = () =>
  <Router>
    <AppRoutes />
  </Router>;

/** ============================ Exports =================================== */
export default App;
