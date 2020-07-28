import * as React from 'react';

import * as api from 'navigader/api';
import { Button, Link, TextField } from 'navigader/components';
import { makeStylesHook } from 'navigader/styles';
import * as routes from 'navigader/routes';
import { UnauthenticatedPage } from './UnauthenticatedPage';


/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  forgotPassword: {
    display: 'block',
    marginTop: theme.spacing(2)
  },
  loginField: {
    width: '100%',
    '& + &': {
      marginTop: theme.spacing(2)
    }
  }
}), 'LoginPage');

/** ============================ Components ================================ */
export const LoginPage: React.FC = () => {
  const classes = useStyles();

  // Component state
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState(false);

  return (
    <UnauthenticatedPage>
      <form onSubmit={onSubmit}>
        <TextField
          className={classes.loginField}
          error={error}
          id="email"
          label="E-mail address"
          name="email"
          onChange={setEmail}
          outlined
        />

        <TextField
          autoComplete="current-password"
          className={classes.loginField}
          error={error}
          helperText={error ? 'Invalid email or password' : ' '}
          id="outlined-secondary"
          label="Password"
          name="password"
          onChange={setPassword}
          outlined
          type="password"
        />

        <Button color="primary" type="submit">Log in</Button>
        <Link className={classes.forgotPassword} to={routes.resetPassword} variant="body2">
          Forgot password?
        </Link>
      </form>
    </UnauthenticatedPage>
  );

  /** ========================== Callbacks ================================= */
  /**
   * Handles form submission, showing errors if the login is unsuccessful.
   *
   * @param event: FormEvent
   *   The event object
   */
  async function onSubmit (event: React.FormEvent) {
    setError(false);
    event.preventDefault();

    let response;
    try {
      response = await api.login(email, password);
    } catch (e) {
      setError(true);
      return;
    }

    if (!response.ok) {
      setError(true);
    } else {
      window.location.assign(routes.dashboard.base);
    }
  }
};
