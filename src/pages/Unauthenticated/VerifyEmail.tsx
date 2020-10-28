import * as React from 'react';
import { useDispatch } from 'react-redux';

import * as api from 'navigader/api';
import {
  Alert,
  Button,
  ContactSupport,
  Flex,
  Progress,
  TextField,
  Typography,
} from 'navigader/components';
import { useRouter } from 'navigader/routes';
import { slices } from 'navigader/store';
import { makeStylesHook } from 'navigader/styles';
import { useAsync, useQueryParams } from 'navigader/util/hooks';
import { UnauthenticatedPage } from './UnauthenticatedPage';

/** ============================ Types ===================================== */
type VerifyEmailProps = {
  token: string;
};

/** ============================ Styles ==================================== */
const useEnterEmailStyles = makeStylesHook(
  (theme) => ({
    alert: {
      marginBottom: theme.spacing(1),
    },
    textField: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(3),
      width: '100%',
    },
  }),
  'EnterEmail'
);

const useVerifyEmailStyles = makeStylesHook(
  (theme) => ({
    paragraph: {
      marginBottom: theme.spacing(2),
    },
  }),
  'VerifyEmail'
);

/** ============================ Components ================================ */
/**
 * Makes an API call to verify the user's email, using the token from the URL's
 * querystring.
 */
const VerifyEmail: React.FC<VerifyEmailProps> = ({ token }) => {
  const routeTo = useRouter();
  const classes = useVerifyEmailStyles();
  const [status, setStatus] = React.useState<'success' | 'error' | 'loading'>('loading');

  useAsync(
    () => api.verifyEmail(token),
    (response) => setStatus(response.ok ? 'success' : 'error')
  );

  switch (status) {
    case 'loading':
      return (
        <Flex.Container direction="column" alignItems="center">
          <Typography className={classes.paragraph}>Verifying...</Typography>
          <Progress circular />
        </Flex.Container>
      );
    case 'success':
      return (
        <Flex.Container direction="column" alignItems="center">
          <Typography className={classes.paragraph}>Your account has been verified!</Typography>
          <Button color="primary" onClick={routeTo.login}>
            Log In
          </Button>
        </Flex.Container>
      );
    case 'error':
      return (
        <Alert type="error">
          Something went wrong verifying your account. Please <ContactSupport />
        </Alert>
      );
  }
};

/**
 * Rendered when there is no `token` query parameter present. This is the screen
 * where the user submits the request to resend the verification email.
 */
const EnterEmail: React.FC = () => {
  const classes = useEnterEmailStyles();
  const dispatch = useDispatch();

  // Component state
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState('');

  return (
    <form onSubmit={sendEmail}>
      <Typography>
        Your account's email address has not yet been verified. Enter your account's email address
        and you will receive a link to verify your account.
      </Typography>

      <TextField className={classes.textField} label="Email address" onChange={setEmail} outlined />

      {error && (
        <Alert className={classes.alert} type="error">
          {error}
        </Alert>
      )}
      <Button color="primary" type="submit">
        Send Email
      </Button>
    </form>
  );

  /** ========================== Callbacks ================================= */
  async function sendEmail(event: React.FormEvent) {
    setError('');
    event.preventDefault();

    try {
      const { error, response } = await api.resendVerificationEmail(email);
      setError(error);

      if (response.ok) {
        dispatch(
          slices.ui.setMessage({
            msg: 'Password reset email has been sent',
            type: 'success',
          })
        );
      }
    } catch (e) {
      dispatch(slices.ui.setMessage({ msg: 'Something went wrong', type: 'error' }));
    }
  }
};

export const VerifyEmailPage: React.FC = () => {
  const [token] = useQueryParams(['token']);
  return (
    <UnauthenticatedPage>
      {token ? <VerifyEmail token={token} /> : <EnterEmail />}
    </UnauthenticatedPage>
  );
};
