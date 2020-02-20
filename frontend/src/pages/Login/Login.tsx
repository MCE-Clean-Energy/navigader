import React, { FormEvent, useState } from 'react';
import { createUseStyles } from 'react-jss';
import assign from 'lodash/assign';

import * as api from '@nav/shared/api';
import logo from '@nav/shared/images/logo.png';
import { Button, Card, TextField, Typography } from '@nav/shared/components';
import { primaryColor, secondaryColor } from '@nav/shared/styles';


/** ============================ Styles ==================================== */
const centerContent = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center'
};

const useStyles = createUseStyles({
  container: {
    display: 'flex',
    flexFlow: 'row nowrap',
    height: '100vh'
  },
  gradient: assign({
    backgroundColor: secondaryColor,
    background: `linear-gradient(0, ${primaryColor} 0%, ${secondaryColor} 100%)`,
    width: '50%'
  }, centerContent),
  navigader: {
    letterSpacing: 25
  }
});

const useLoginCardStyles = createUseStyles({
  loginCard: assign({
    width: '50%'
  }, centerContent),
  loginField: {
    width: '100%'
  },
  loginForm: {
    marginTop: '3rem'
  },
  logo: {
    width: 300
  },
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
      <div>
        <img src={logo} className={classes.logo} alt="logo" />
        
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
      </div>
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
    
    if (response.status === 200) {
      window.location.assign('/load');
    } else {
      setError(true);
    }
  }
};

const LoginPage: React.FC = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <div className={classes.gradient}>
        <Typography variant="h2" className={classes.navigader}>
          NAVIGADER
        </Typography>
      </div>
      <LoginCard />
    </div>
  );
};

/** ============================ Exports =================================== */
export default LoginPage;
