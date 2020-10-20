import * as React from 'react';
import { useDispatch } from 'react-redux';

import * as api from 'navigader/api';
import { Alert, Button, TextField } from 'navigader/components';
import { useRouter } from 'navigader/routes';
import { slices } from 'navigader/store';
import { makeStylesHook } from 'navigader/styles';
import { UnauthenticatedPage } from './UnauthenticatedPage';


/** ============================ Types ===================================== */
type SignupState = {
  email: '';
  password1: '';
  password2: '';
  username: '';
};

/** ============================ Styles ==================================== */
const useEnterEmailStyles = makeStylesHook(theme => ({
  alert: {
    marginTop: theme.spacing(2)
  },
  button: {
    marginTop: theme.spacing(3)
  },
  textField: {
    marginTop: theme.spacing(2),
    width: '100%'
  }
}), 'SignupPage');

/** ============================ Components ================================ */
/**
 * Rendered when there is no `token` query parameter present. This is the screen where the user
 * submits the request to reset their password.
 */
export const SignupPage: React.FC = () => {
  const classes = useEnterEmailStyles();
  const dispatch = useDispatch();
  const routeTo = useRouter();

  // Component state
  const [error, setError] = React.useState<string>();
  const [state, setState] = React.useState<SignupState>({
    email: '',
    password1: '',
    password2: '',
    username: ''
  });

  return (
    <UnauthenticatedPage>
      <form onSubmit={signup}>
        <TextField
          className={classes.textField}
          label="Username"
          onChange={updateStateField('username')}
          outlined
        />

        <TextField
          className={classes.textField}
          label="Password"
          onChange={updateStateField('password1')}
          outlined
          type="password"
        />

        <TextField
          className={classes.textField}
          label="Confirm password"
          onChange={updateStateField('password2')}
          outlined
          type="password"
        />

        <TextField
          className={classes.textField}
          label="Email address"
          onChange={updateStateField('email')}
          outlined
        />

        {error && <Alert className={classes.alert} type="error">{error}</Alert>}
        <Button className={classes.button} color="primary" type="submit">Sign Up</Button>
      </form>
    </UnauthenticatedPage>
  );

  /** ========================== Helpers =================================== */
  function updateStateField (field: keyof SignupState) {
    return function (value: string) {
      setState({ ...state, [field]: value });
    }
  }

  /** ========================== Callbacks ================================= */
  async function signup (event: React.FormEvent) {
    setError(undefined);
    event.preventDefault();

    try {
      const { error, response } = await api.signUp(
        state.email,
        state.password1,
        state.password2,
        state.username
      );

      setError(error);
      if (response.ok) {
        dispatch(slices.ui.setMessage({
          msg:
            `A confirmation email has been sent to ${state.email}. Please confirm your account ` +
            'and log in.',
          type: 'success'
        }));
        routeTo.login();
      }
    } catch (e) {
      dispatch(slices.ui.setMessage({ msg: 'Something went wrong', type: 'error' }));
    }
  }
};
