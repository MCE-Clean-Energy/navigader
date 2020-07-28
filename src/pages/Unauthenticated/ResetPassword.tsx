import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import * as api from 'navigader/api';
import { Alert, Button, TextField, Typography } from 'navigader/components';
import * as routes from 'navigader/routes';
import { slices } from 'navigader/store';
import { makeStylesHook } from 'navigader/styles';
import { useQueryParams } from 'navigader/util/hooks';
import { UnauthenticatedPage } from './UnauthenticatedPage';


/** ============================ Types ===================================== */
type ConfirmResetProps = {
  token: string;
  uid: string;
};

/** ============================ Styles ==================================== */
const useEnterEmailStyles = makeStylesHook(theme => ({
  alert: {
    marginBottom: theme.spacing(1)
  },
  textField: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
    width: '100%'
  }
}), 'EnterEmail');

const useConfirmResetStyles = makeStylesHook(theme => ({
  alert: {
    marginBottom: theme.spacing(1)
  },
  confirmPassword: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
  }
}), 'ConfirmReset');

/** ============================ Components ================================ */
/**
 * Rendered when there is a `token` query parameter present. This is the screen where the user
 * confirms that they wish to reset their password. The `token` identifies the account to reset.
 */
const ConfirmReset: React.FC<ConfirmResetProps> = ({ token, uid }) => {
  const classes = useConfirmResetStyles();
  const dispatch = useDispatch();
  const history = useHistory();

  // Component state
  const [password1, setPassword1] = React.useState('');
  const [password2, setPassword2] = React.useState('');
  const [error, setError] = React.useState<string>();
  return (
    <form onSubmit={confirmReset}>
      <TextField label="Password" onChange={setPassword1} outlined type="password" />
      <TextField
        className={classes.confirmPassword}
        label="Confirm password"
        onChange={setPassword2}
        outlined
        type="password"
      />

      {error && <Alert className={classes.alert} type="error">{error}</Alert>}
      <Button color="primary" type="submit">Change password</Button>
    </form>
  );

  /** ========================== Callbacks ================================= */
  async function confirmReset (event: React.FormEvent) {
    setError(undefined);
    event.preventDefault();

    try {
      const { response, error } = await api.confirmPasswordReset(password1, password2, token, uid);
      setError(error);

      if (response.ok) {
        dispatch(slices.ui.setMessage({
          msg: 'Your password has been reset!', type: 'success'
        }));
        history.push(routes.login);
      }
    } catch (e) {
      dispatch(slices.ui.setMessage({ msg: 'Something went wrong', type: 'error' }));
    }
  }
};

/**
 * Rendered when there is no `token` query parameter present. This is the screen where the user
 * submits the request to reset their password.
 */
const EnterEmail: React.FC = () => {
  const classes = useEnterEmailStyles();
  const dispatch = useDispatch();

  // Component state
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState<string>();
  return (
    <form onSubmit={sendEmail}>
      <Typography variant="body1">
        Enter your account's verified email address and you will receive a password reset link.
      </Typography>

      <TextField
        className={classes.textField}
        id="email"
        label="E-mail address"
        name="email"
        onChange={setEmail}
        outlined
      />

      {error && <Alert className={classes.alert} type="error">{error}</Alert>}
      <Button color="primary" type="submit">Send Email</Button>
    </form>
  );

  /** ========================== Callbacks ================================= */
  async function sendEmail (event: React.FormEvent) {
    setError(undefined);
    event.preventDefault();

    try {
      const { error, response } = await api.sendResetPasswordEmail(email);
      setError(error);

      if (response.ok) {
        dispatch(slices.ui.setMessage({
          msg: 'Password reset email has been sent', type: 'success'
        }));
      }
    } catch (e) {
      dispatch(slices.ui.setMessage({ msg: 'Something went wrong', type: 'error' }));
    }
  }
};

export const ResetPasswordPage: React.FC = () => {
  const [token, uid] = useQueryParams(['token', 'uid']);
  return (
    <UnauthenticatedPage>
      {
        token && uid
          ? <ConfirmReset token={token} uid={uid} />
          : <EnterEmail />
      }
    </UnauthenticatedPage>
  );
};
