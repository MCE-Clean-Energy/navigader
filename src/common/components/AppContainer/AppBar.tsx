import * as React from 'react';
import { useHistory } from 'react-router-dom';
import MuiAppBar from '@material-ui/core/AppBar';
import MuiToolbar from '@material-ui/core/Toolbar';

import navigaderImage from 'navigader/images/navigader.png';
import * as routes from 'navigader/routes';
import { makeStylesHook, white } from 'navigader/styles';
import { Gradient } from '../branding';
import { Button } from '../Button';
import * as Flex from '../Flex';
import { Padding } from '../Padding';
import { AccountMenu } from './AccountMenu';
import { Feedback } from './Feedback';


const useStyles = makeStylesHook(theme => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  container: {
    boxSizing: 'border-box',
    width: '100%'
  },
  gradient: {
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    left: 0,
    padding: `0 ${theme.spacing(2)}px`,
    position: 'absolute',
    right: 0,
    top: 0
  },
  rightSide: {
    color: white,
    '& > *': {
      color: 'inherit',
      marginLeft: theme.spacing(1)
    }
  },
  navigaderText: {
    width: 250
  },
  toolbar: {
    position: 'relative'
  }
}), 'AppBar');

/** ============================ Components ================================ */
export const AppBar: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();

  return (
    <MuiAppBar position="fixed" className={classes.appBar}>
      <MuiToolbar className={classes.toolbar}>
        <Gradient className={classes.gradient} invert orientation="horizontal" startPercent={20}>
          <Padding className={classes.container}>
            <Flex.Container alignItems="center">
              <Flex.Item grow>
                <img src={navigaderImage} className={classes.navigaderText} alt="NavigaDER" />
              </Flex.Item>

              <Flex.Item>
                <Flex.Container alignItems="center" className={classes.rightSide}>
                  <Button.Text onClick={goToRoadmap}>Roadmap</Button.Text>
                  <Feedback />
                  <AccountMenu />
                </Flex.Container>
              </Flex.Item>
            </Flex.Container>
          </Padding>
        </Gradient>
      </MuiToolbar>
    </MuiAppBar>
  );

  /** ========================== Callbacks ================================= */
  function goToRoadmap () {
    history.push(routes.roadmap);
  }
};
