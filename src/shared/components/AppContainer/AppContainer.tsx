import React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';

import { Theme } from '@nav/shared/styles';
import { Container } from '../Container';
import * as Flex from '../Flex';
import { AppBar } from './AppBar';
import { SideDrawer } from './SideDrawer';


/** ============================ Styles ==================================== */
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBarSpacer: {
      ...theme.mixins.toolbar,
    },
    container: {
      boxSizing: 'border-box',
      height: '100vh',
      overflow: 'auto'
    },
    content: {
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
        <Container>
          <div className={classes.appBarSpacer} />
          <div className={classes.content}>
            {/** Actual page content */}
            {children}
          </div>
        </Container>
      </Flex.Item>
    </Flex.Container>
  );
};

