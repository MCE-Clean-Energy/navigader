import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import ButtonBase from '@material-ui/core/ButtonBase';
import Drawer from '@material-ui/core/Drawer';
import useTheme from '@material-ui/core/styles/useTheme';

import * as routes from '@nav/shared/routes';
import { primaryColor, Theme } from '@nav/shared/styles';
import { Gradient } from './branding';
import { Centered } from './Centered';
import { Container } from './Container';
import * as Flex from './Flex';
import { Padding } from './Padding';
import navigaderImage from '../images/navigader.png';


/** ============================ Types ===================================== */
type DrawerButtonProps = React.PropsWithChildren<
  RouteComponentProps & {
    linkTo: string;
  }
>;

/** ============================ Styles ==================================== */
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      boxSizing: 'border-box',
      height: '100vh',
      overflow: 'auto',
      padding: theme.spacing(3)
    }
  })
);

const drawerWidth = 250;
const useDrawerStyles = makeStyles((theme: Theme) =>
  createStyles({
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
      flexGrow: 1
    },
    navigaderText: {
      width: '100%'
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
const DrawerButton = withRouter(
  ({ children, history, linkTo }: DrawerButtonProps) => {
    const classes = useDrawerButtonStyles();
    return (
      <ButtonBase classes={{ root: classes.root }} onClick={goToPage}>
        <Centered children={children} />
      </ButtonBase>
    );
    
    function goToPage () {
      history.push(linkTo);
    }
  }
);

const DrawerPadding: React.FC = (props) => {
  const theme = useTheme();
  return <Padding pad={drawerPadding(theme)} {...props} />;
};

const SideDrawer: React.FC = () => {
  const classes = useDrawerStyles();
  return (
    <Drawer
      anchor="left"
      classes={{ paper: classes.drawerPaper }}
      className={classes.drawer}
      variant="permanent"
      open
    >
      <Flex.Container alignItems="stretch" className={classes.flexContainer} direction="column">
        <Gradient height={100} finishPercent={50}>
          <DrawerPadding>
            <Centered>
              <img src={navigaderImage} className={classes.navigaderText} alt="NavigaDER" />
            </Centered>
          </DrawerPadding>
        </Gradient>
        
        <Flex.Item grow>
          <DrawerButton linkTo={routes.load}>Load</DrawerButton>
        </Flex.Item>
        <Gradient height={100} invert />
      </Flex.Container>
    </Drawer>
  );
};

export const AppContainer: React.FC = ({ children }) => {
  const classes = useStyles();
  return (
    <Flex.Container>
      <SideDrawer />
      <Flex.Item className={classes.container} grow>
        <Container>
          {/** Actual page content */}
          {children}
        </Container>
      </Flex.Item>
    </Flex.Container>
  );
};

/** ============================ Helpers =================================== */
function drawerPadding (theme: Theme) {
  return theme.spacing(2);
}
