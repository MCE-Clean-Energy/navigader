import * as React from 'react';
import { useDispatch } from 'react-redux';

import * as api from 'navigader/api';
import { routes, usePushRouter } from 'navigader/routes';
import { slices } from 'navigader/store';
import { makeStylesHook, white } from 'navigader/styles';
import { cookieManager, HELP_PAGE_URI, models, sendSupportEmail } from 'navigader/util';

import { Button } from '../Button';
import { Dialog } from '../Dialog';
import * as Flex from '../Flex';
import { Link } from '../Link';
import { List } from '../List';
import { Menu } from '../Menu';
import { TextField } from '../TextField';
import { Tooltip } from '../Tooltip';

/** ============================ Styles ==================================== */
const useHelpStyles = makeStylesHook(() => ({ helpButton: { color: white } }), 'Help');
const useStyles = makeStylesHook(
  (theme) => ({
    actions: {
      'color': white,
      '& > *': {
        color: 'inherit',
        marginLeft: theme.spacing(1),
      },
    },
  }),
  'AppBarActions'
);

/** ============================ Components ================================ */
const Feedback: React.FC = () => {
  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string>('');
  const dialogId = 'feedback-dialog-title';
  return (
    <>
      <Tooltip title="Submit Feedback">
        <Button icon="feedback" onClick={() => setDialogOpen(true)} />
      </Tooltip>

      <Dialog fullWidth open={dialogOpen} onClose={closeDialog} aria-labelledby={dialogId}>
        <Dialog.Title id={dialogId}>Help us improve NavigaDER</Dialog.Title>
        <Dialog.Content>
          <TextField
            autoFocus
            onChange={setFeedback}
            placeholder="Type your feedback here..."
            value={feedback}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button.Text onClick={closeDialog}>Cancel</Button.Text>
          <Button.Text color="primary" disabled={feedback.length === 0} onClick={submitFeedback}>
            Submit
          </Button.Text>
        </Dialog.Actions>
      </Dialog>
    </>
  );

  /** ========================== Callbacks ================================= */
  function closeDialog() {
    setDialogOpen(false);
  }

  function submitFeedback() {
    sendSupportEmail('NavigaDER feedback', feedback);
    setFeedback('');
    dispatch(
      slices.ui.setMessage({
        duration: null,
        msg: 'Thank you for your feedback!',
        type: 'success',
      })
    );
    closeDialog();
  }
};

const AccountMenu: React.FC = () => {
  const routeTo = usePushRouter();
  return (
    <Menu
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      icon="account"
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <List.Item onClick={routeTo.settings}>
        <List.Item.Text>Settings</List.Item.Text>
      </List.Item>
      <List.Item onClick={logout}>
        <List.Item.Text>Logout</List.Item.Text>
      </List.Item>
    </Menu>
  );

  /** ========================== Callbacks ================================= */
  function logout() {
    cookieManager.remove.authToken();
    models.polling.reset();
    api.logout().catch();

    // Use the Location API to navigate to the login screen instead of React Router so that page
    // state is reset. Using a redirect (as React Router does) would maintain the contents/history
    // of the redux store and leak data outside the user's session.
    window.location.href = routes.login;
  }
};

const Help: React.FC = () => {
  const classes = useHelpStyles();

  // If the configuration is missing the help page URI, render nothing
  if (!HELP_PAGE_URI) return null;

  return (
    <Tooltip title="Visit the User Manual">
      <Link.NewTab to={HELP_PAGE_URI} noUnderline>
        <Button.Text className={classes.helpButton}>Help</Button.Text>
      </Link.NewTab>
    </Tooltip>
  );
};

export const AppBarActions: React.FC = () => {
  const classes = useStyles();
  return (
    <Flex.Container alignItems="center" className={classes.actions}>
      <Help />
      <Feedback />
      <AccountMenu />
    </Flex.Container>
  );
};
