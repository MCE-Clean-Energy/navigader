import * as React from 'react';
import classNames from 'classnames';

import { makeStylesHook } from 'navigader/styles';
import * as Flex from '../Flex';
import { AppBar } from './AppBar';
import { DRAWER_WIDTH } from './common';
import { SideDrawer } from './SideDrawer';

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(
  (theme) => ({
    appBarSpacer: {
      ...theme.mixins.toolbar,
    },
    container: {
      backgroundColor: theme.palette.grey[50],
      boxSizing: 'border-box',
      display: 'flex',
      flexFlow: 'column nowrap',
      height: '100vh',
      marginLeft: -DRAWER_WIDTH,
      minWidth: 800,
      overflow: 'auto',
      padding: `0 ${theme.spacing(3)}px`,
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    containerShift: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    },
    content: {
      'flexGrow': 1,
      'paddingBottom': theme.spacing(3),
      // Addresses a Safari rendering issue
      '& > *': {
        flexShrink: 0,
      },
    },
    root: {
      overflow: 'auto',
    },
  }),
  'AppContainer'
);

/** ============================ Components ================================ */
export const AppContainer: React.FC = ({ children }) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  return (
    <Flex.Container className={classes.root}>
      <AppBar drawerOpen={open} openDrawer={() => setOpen(true)} />
      <SideDrawer open={open} closeDrawer={() => setOpen(false)} />
      <Flex.Item className={classNames(classes.container, { [classes.containerShift]: open })} grow>
        <div className={classes.appBarSpacer} />
        <Flex.Container
          alignItems="stretch"
          className={classes.content}
          direction="column"
          justifyContent="flex-start"
        >
          {/** Actual page content */}
          {children}
        </Flex.Container>
      </Flex.Item>
    </Flex.Container>
  );
};
