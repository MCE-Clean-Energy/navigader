import React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import { Theme } from '@nav/shared/styles';
import * as Flex from '../Flex';
import { AppBar } from './AppBar';
import { SideDrawer } from './SideDrawer';


/** ============================ Styles ==================================== */
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBarSpacer: {
      ...theme.mixins.toolbar,
    },
    center: {
      display: 'flex',
      flexDirection: 'column'
    },
    container: {
      boxSizing: 'border-box',
      display: 'flex',
      height: '100vh',
      overflow: 'auto'
    },
    content: {
      flexGrow: 1,
      padding: `${theme.spacing(3)}px 0`
    }
  })
);

/** ============================ Components ================================ */
export const AppContainer: React.FC = ({ children }) => {
  const classes = useStyles();
  return (
    <Flex.Container>
      <AppBar />
      <SideDrawer />
      <Flex.Item className={classes.container} grow>
        <Container className={classes.center}>
          <div className={classes.appBarSpacer} />
          <Flex.Container alignItems="stretch" className={classes.content} direction="column" justifyContent="flex-start">
            {/** Actual page content */}
            {children}
          </Flex.Container>
        </Container>
      </Flex.Item>
    </Flex.Container>
  );
};

