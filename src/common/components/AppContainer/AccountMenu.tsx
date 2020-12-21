import * as React from 'react';

import * as api from 'navigader/api';
import { routes, usePushRouter } from 'navigader/routes';
import { cookieManager, models } from 'navigader/util';

import { List } from '../List';
import { Menu } from '../Menu';

export const AccountMenu: React.FC = () => {
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
