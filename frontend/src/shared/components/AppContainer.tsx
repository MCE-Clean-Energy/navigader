import React from 'react';
import { createUseStyles } from 'react-jss';

import { Theme } from '@nav/shared/styles';
import { Container } from './wrappers';


/** ============================ Styles ==================================== */
const useStyles = createUseStyles((theme: Theme) => ({
  container: {
    boxSizing: 'border-box',
    height: '100vh',
    overflow: 'auto',
    padding: theme.spacing(3)
  }
}));

/** ============================ Components ================================ */
const AppContainer: React.FC = ({ children }) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <Container>
        {children}
      </Container>
    </div>
  );
};

/** ============================ Exports =================================== */
export default AppContainer;
