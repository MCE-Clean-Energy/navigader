import * as React from 'react';
import { useHistory } from 'react-router-dom';
import ButtonBase from '@material-ui/core/ButtonBase';
import Drawer from '@material-ui/core/Drawer';

import * as routes from 'navigader/routes';
import { makeStylesHook, white } from 'navigader/styles';
import { Button } from '../Button';
import { Centered } from '../Centered';
import * as Flex from '../Flex';
import { DRAWER_WIDTH } from './common';


/** ============================ Types ===================================== */
type DrawerButtonProps = {
  linkTo: string;
};

type SideDrawerProps = {
  open: boolean;
  closeDrawer: () => void;
};

/** ============================ Styles ==================================== */
const useDrawerStyles = makeStylesHook(theme => ({
  appBarSpacer: {
    ...theme.mixins.toolbar
  },
  drawer: {
    height: '100vh',
    flexShrink: 0,
    width: DRAWER_WIDTH,
    boxShadow: theme.shadows[24]
  },
  drawerHeader: {
    ...theme.mixins.flex({ align: 'center', justify: 'flex-end' }),
    ...theme.mixins.toolbar,
    padding: theme.spacing(0, 1),
    '& > *': {
      color: 'inherit'
    }
  },
  drawerLogo: {
    padding: theme.spacing(2)
  },
  drawerPaper: {
    backgroundColor: theme.palette.primary.main,
    borderRight: 'none',
    color: white,
    width: DRAWER_WIDTH
  },
  flexContainer: {
    flexGrow: 1,
    marginTop: theme.spacing(2)
  }
}), 'SideDrawer');

const useDrawerButtonStyles = makeStylesHook(theme => ({
  root: {
    padding: theme.spacing(1),
    transition: theme.transitions.create('background-color', {
      duration: theme.transitions.duration.shortest
    }),
    width: '100%',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      // Reset on touch devices, it doesn't add specificity
      '@media (hover: none)': {
        backgroundColor: 'transparent'
      }
    },
    // Renders it in button font
    ...theme.typography.button
  }
}), 'DrawerButton');

/** ============================ Components ================================ */
const DrawerButton: React.FC<DrawerButtonProps> = ({ children, linkTo }) => {
  const classes = useDrawerButtonStyles();
  const history = useHistory();
  return (
    <ButtonBase classes={{ root: classes.root }} onClick={goToPage}>
      <Centered children={children} />
    </ButtonBase>
  );

  function goToPage () {
    history.push(linkTo);
  }
};

export const SideDrawer: React.FC<SideDrawerProps> = ({ open, closeDrawer }) => {
  const classes = useDrawerStyles();
  return (
    <Drawer
      anchor="left"
      classes={{ paper: classes.drawerPaper }}
      className={classes.drawer}
      open={open}
      variant="persistent"
    >
      <div className={classes.drawerHeader}>
        <Button icon="chevronLeft" onClick={closeDrawer} />
      </div>
      <Flex.Container alignItems="stretch" className={classes.flexContainer} direction="column">
        <Flex.Item grow>
          <DrawerButton linkTo={routes.dashboard.base}>Dashboard</DrawerButton>
          <DrawerButton linkTo={routes.load.base}>Load</DrawerButton>
          <DrawerButton linkTo={routes.upload}>Upload</DrawerButton>
          <DrawerButton linkTo={routes.rates.base}>Rate Plans</DrawerButton>
        </Flex.Item>
      </Flex.Container>
    </Drawer>
  );
};
