import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import ButtonBase from '@material-ui/core/ButtonBase';
import Drawer from '@material-ui/core/Drawer';

import * as routes from '@nav/shared/routes';
import { primaryColor, Theme } from '@nav/shared/styles';
import { Centered } from '../Centered';
import * as Flex from '../Flex';


/** ============================ Types ===================================== */
type DrawerButtonProps = {
  linkTo: string;
};

/** ============================ Styles ==================================== */
const drawerWidth = 250;
const useDrawerStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBarSpacer: {
      ...theme.mixins.toolbar
    },
    drawer: {
      height: '100vh',
      flexShrink: 0,
      width: drawerWidth,
      boxShadow: theme.shadows[24]
    },
    drawerLogo: {
      padding: drawerPadding(theme)
    },
    drawerPaper: {
      backgroundColor: primaryColor,
      borderRight: 'none',
      color: '#fff',
      width: drawerWidth
    },
    flexContainer: {
      flexGrow: 1,
      marginTop: theme.spacing(2)
    }
  })
);

const useDrawerButtonStyles = makeStyles((theme: Theme) =>
  createStyles({
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
  })
);

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

export const SideDrawer: React.FC = () => {
  const classes = useDrawerStyles();
  return (
    <Drawer
      anchor="left"
      classes={{ paper: classes.drawerPaper }}
      className={classes.drawer}
      variant="permanent"
      open
    >
      <div className={classes.appBarSpacer} />
      <Flex.Container alignItems="stretch" className={classes.flexContainer} direction="column">
        <Flex.Item grow>
          <DrawerButton linkTo={routes.dashboard.base}>Dashboard</DrawerButton>
          <DrawerButton linkTo={routes.load}>Load</DrawerButton>
          <DrawerButton linkTo={routes.upload}>Upload</DrawerButton>
        </Flex.Item>
      </Flex.Container>
    </Drawer>
  );
};

/** ============================ Helpers =================================== */
function drawerPadding (theme: Theme) {
  return theme.spacing(2);
}
