import * as React from 'react';
import { useHistory } from 'react-router-dom';

import * as api from 'navigader/api';
import { poller } from 'navigader/models/common';
import * as routes from 'navigader/routes';
import { cookieManager } from 'navigader/util/cookies';
import { List } from '../List';
import { Menu } from '../Menu';


export const AccountMenu: React.FC = () => {
  const history = useHistory();
  return (
    <Menu
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right'}}
      icon="account"
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <List.Item onClick={goToSettingsPage}>
        <List.Item.Text>Settings</List.Item.Text>
      </List.Item>
      <List.Item onClick={logout}>
        <List.Item.Text>Logout</List.Item.Text>
      </List.Item>
    </Menu>
  );

  /** ============================ Callbacks =============================== */
  function goToSettingsPage () {
    history.push(routes.settings);
  }

  function logout () {
    cookieManager.remove.authToken();
    poller.reset();
    api.logout().catch();
    history.push(routes.login);
  }
};
