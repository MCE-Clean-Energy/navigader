import * as React from 'react';
import { useDispatch } from 'react-redux';

import * as api from 'navigader/api';
import { Alert, Button, Card, PageHeader, TextField, Typography } from 'navigader/components';
import { slices } from 'navigader/store';
import { makeStylesHook } from 'navigader/styles';

/** ============================ Types ===================================== */
enum FormError {
  // Errors we can catch on the front end
  noOldPassword,
  noNewPassword1,
  noNewPassword2,
  passwordMismatch,

  // Errors from the server
  oldPasswordInvalid,
}

type ChangePasswordError = FormError | string[];
type ErrorAlertProps = {
  error: ChangePasswordError | undefined;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(
  (theme) => ({
    inputsWrapper: {
      marginBottom: theme.spacing(3),
    },
    textfield: {
      marginTop: theme.spacing(1),
      width: 500,
    },
  }),
  'SettingsPage'
);

const useErrorAlertStyles = makeStylesHook(
  (theme) => ({
    alert: {
      marginBottom: theme.spacing(1),
    },
  }),
  'SettingsPage'
);

/** ============================ Components ================================ */
const ErrorAlert: React.FC<ErrorAlertProps> = ({ error }) => {
  const classes = useErrorAlertStyles();

  if (error === undefined) return null;
  const errorText = (() => {
    if (Array.isArray(error)) {
      return error[0];
    }

    switch (error) {
      case FormError.noOldPassword:
        return 'Please enter your old password';
      case FormError.noNewPassword1:
        return 'Please enter a new password';
      case FormError.noNewPassword2:
        return 'Both password fields must be filled';
      case FormError.passwordMismatch:
        return 'Passwords do not match';
      case FormError.oldPasswordInvalid:
        return 'Old password is invalid';
    }
  })();

  return (
    <Alert className={classes.alert} type="error">
      {errorText}
    </Alert>
  );
};

export const SettingsPage: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  // State
  const [oldPassword, setOldPassword] = React.useState<string>('');
  const [newPassword1, setNewPassword1] = React.useState<string>('');
  const [newPassword2, setNewPassword2] = React.useState<string>('');
  const [error, setError] = React.useState<ChangePasswordError>();

  // Refs
  const oldPasswordRef = React.useRef<HTMLInputElement>(null);
  const newPassword1Ref = React.useRef<HTMLInputElement>(null);
  const newPassword2Ref = React.useRef<HTMLInputElement>(null);

  return (
    <>
      <PageHeader title="Settings" />

      {/* Wrap contents in <div> to escape flex container */}
      <div>
        <Card raised style={{ display: 'inline-block' }}>
          <Typography variant="h6">Change Password</Typography>
          <div className={classes.inputsWrapper}>
            <TextField
              autoComplete="current-password"
              className={classes.textfield}
              error={error === FormError.noOldPassword || error === FormError.oldPasswordInvalid}
              label="Old password"
              onChange={setOldPassword}
              outlined
              ref={oldPasswordRef}
              type="password"
              value={oldPassword}
            />

            <TextField
              autoComplete="new-password"
              className={classes.textfield}
              error={error === FormError.noNewPassword1 || error === FormError.passwordMismatch}
              label="New password"
              onChange={setNewPassword1}
              outlined
              ref={newPassword1Ref}
              type="password"
              value={newPassword1}
            />

            <TextField
              autoComplete="new-password"
              className={classes.textfield}
              error={error === FormError.noNewPassword2 || error === FormError.passwordMismatch}
              label="Confirm new password"
              onChange={setNewPassword2}
              outlined
              ref={newPassword2Ref}
              type="password"
              value={newPassword2}
            />
          </div>

          <ErrorAlert error={error} />

          <Button color="primary" onClick={updatePassword}>
            Update
          </Button>
        </Card>
      </div>
    </>
  );

  /** ========================== Callbacks ================================= */
  async function updatePassword() {
    // Validate the inputs
    const error = validateInputs();
    setError(error);
    if (error) return;

    // Make the request to change the password
    const response = await api.changePassword(oldPassword, newPassword1, newPassword2);

    // Check for server validation failures
    if (response.old_password) {
      setError(FormError.oldPasswordInvalid);
    } else if (response.new_password1) {
      setError(response.new_password1);
    } else if (response.new_password2) {
      setError(response.new_password2);
    } else {
      // No errors. Password successfully changed
      setError(undefined);
      dispatch(slices.ui.setMessage({ msg: 'Password successfully changed', type: 'success' }));
    }
  }

  /**
   * Helper function to validate the password inputs
   */
  function validateInputs() {
    if (!oldPassword) {
      focusInput(oldPasswordRef);
      return FormError.noOldPassword;
    } else if (!newPassword1) {
      focusInput(newPassword1Ref);
      return FormError.noNewPassword1;
    } else if (!newPassword2) {
      focusInput(newPassword2Ref);
      return FormError.noNewPassword2;
    } else if (newPassword1 !== newPassword2) {
      return FormError.passwordMismatch;
    }
  }

  /**
   * Helper method for focusing on an input
   *
   * @param {React.RefObject} ref: the `ref` to the input that should be focused
   */
  function focusInput(ref: React.RefObject<HTMLInputElement>) {
    if (ref.current) {
      ref.current.focus();
    }
  }
};
