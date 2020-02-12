import React from 'react';
import { createUseStyles } from 'react-jss';

import { Container } from './wrappers';


/** ============================ Styles ==================================== */
const useStyles = createUseStyles({
  container: {
    height: '100vh',
    overflow: 'auto',
    padding: '2rem'
  }
});

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
