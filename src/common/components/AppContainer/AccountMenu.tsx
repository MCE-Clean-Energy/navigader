import * as React from 'react';

import * as api from 'navigader/api';
import { usePushRouter } from 'navigader/routes';
import { models } from 'navigader/util';
import { cookieManager } from 'navigader/util/cookies';

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
    routeTo.login();
  }
};
