import * as React from 'react';
import { useHistory } from 'react-router-dom';
import MuiAppBar from '@material-ui/core/AppBar';
import MuiToolbar from '@material-ui/core/Toolbar';
import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';

import navigaderImage from '@nav/common/images/navigader.png';
import * as routes from '@nav/common/routes';
import { Theme } from '@nav/common/styles';
import { removeCookie } from '@nav/common/util';
import { Gradient } from '../branding';
import { Button } from '../Button';
import * as Flex from '../Flex';
import { Padding } from '../Padding';


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
    container: {
      boxSizing: 'border-box',
      width: '100%'
    },
    gradient: {
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0
    },
    logoutButton: {
      color: 'white'
    },
    navigaderText: {
      width: 250
    },
    toolbar: {
      position: 'relative'
    }
  })
);

/** ============================ Components ================================ */
export const AppBar: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  
  return (
    <MuiAppBar position="fixed" className={classes.appBar}>
      <MuiToolbar className={classes.toolbar}>
        <Gradient className={classes.gradient} invert orientation="horizontal" startPercent={20}>
          <Padding className={classes.container} pad={theme.spacing(2)}>
            <Flex.Container>
              <Flex.Item grow>
                <img src={navigaderImage} className={classes.navigaderText} alt="NavigaDER" />
              </Flex.Item>
              
              <Flex.Item>
                <Button.Text className={classes.logoutButton} onClick={logout}>Logout</Button.Text>
              </Flex.Item>
            </Flex.Container>
          </Padding>
        </Gradient>
      </MuiToolbar>
    </MuiAppBar>
  );
  
  /** ============================ Callbacks =============================== */
  function logout () {
    removeCookie('authToken');
    history.push(routes.login);
  }
};
