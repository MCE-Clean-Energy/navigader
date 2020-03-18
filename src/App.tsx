import * as React from 'react';
import { BrowserRouter as Router, Switch, Redirect, Route, RouteProps } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { Alert, AppContainer, Snackbar, ThemeProvider } from '@nav/shared/components';
import * as routes from '@nav/shared/routes';
import { slices } from '@nav/shared/store';
import { getCookie } from '@nav/shared/util';
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
  const userAuthenticated = getCookie('authToken') !== undefined;
  return (
    <Route
      {...rest}
      render={({ location }) =>
        userAuthenticated ? children : (
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
  
const App: React.FC = () =>
  <Router>
    <AppRoutes />
  </Router>;

/** ============================ Exports =================================== */
export default App;
