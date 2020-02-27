import React, { FormEvent, useState } from 'react';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

import * as api from '@nav/shared/api';
import { Button, Card, Flex, Branding, TextField, Typography } from '@nav/shared/components';


/** ============================ Styles ==================================== */
const useStyles = createUseStyles({
  container: {
    height: '100vh'
  },
  gradient: {
    width: '50%'
  },
  navigader: {
    letterSpacing: 25
  }
});

const useLoginCardStyles = createUseStyles({
  loginCard: {
    width: '50%'
  },
  loginCardContent: {
    height: '100%'
  },
  loginField: {
    width: '100%'
  },
  loginForm: {
    marginTop: '3rem'
  }
});

const useSpacerStyles = createUseStyles({
  spacer: {
    marginTop: '1rem'
  }
});

/** ============================ Components ================================ */
const Spacer: React.FC = () => {
  const classes = useSpacerStyles();
  return <div className={classes.spacer} />;
};

const LoginCard: React.FC = () => {
  const classes = useLoginCardStyles();
  
  // Component state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  
  return (
    <Card className={classes.loginCard} raised>
      <Flex.Container alignItems="center" className={classes.loginCardContent} direction="column" justifyContent="center">
        <Branding.Logo width={300} />
        
        <form className={classes.loginForm} onSubmit={onSubmit}>
          <TextField
            className={classes.loginField}
            error={error}
            id="email"
            label="E-mail address"
            name="username"
            onChange={e => setUsername(e.target.value)}
            outlined
          />
          
          <Spacer />
          
          <TextField
            autoComplete="current-password"
            className={classes.loginField}
            error={error}
            helperText={error ? 'Invalid username or password' : ' '}
            id="outlined-secondary"
            label="Password"
            name="password"
            onChange={e => setPassword(e.target.value)}
            outlined
            type="password"
          />
          
          <Spacer />
          
          <Button color="primary" type="submit">Log in</Button>
        </form>
      </Flex.Container>
    </Card>
  );
  
  /**
   * Handles form submission, showing errors if the login is unsuccessful.
   *
   * @param event: FormEvent
   *   The event object
   */
  async function onSubmit (event: FormEvent) {
    setError(false);
    
    event.preventDefault();
    const response = await api.login(username, password);
    
    if (response.status !== 200) {
      setError(true);
    }
  }
};

const LoginPage: React.FC = () => {
  const classes = useStyles();
  const gradientClasses = classNames(
    classes.gradient,
    Branding.useGradientStyles().root
  );
  
  return (
    <Flex.Container alignItems="stretch" className={classes.container}>
      <Flex.Container className={gradientClasses} direction="column" justifyContent="center">
        <Typography variant="h2" className={classes.navigader}>
          NAVIGADER
        </Typography>
      </Flex.Container>
      
      <LoginCard />
    </Flex.Container>
  );
};

/** ============================ Exports =================================== */
export default LoginPage;
