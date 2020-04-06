import * as React from 'react';
import classNames from 'classnames';

import * as api from '@nav/shared/api';
import { Button, Card, Flex, Branding, TextField, Typography } from '@nav/shared/components';
import { makeStylesHook } from '@nav/shared/styles';


/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(() => ({
  container: {
    height: '100vh'
  },
  gradient: {
    width: '50%'
  },
  navigader: {
    letterSpacing: 25
  }
}));

const useLoginCardStyles = makeStylesHook(() => ({
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
}));

const useSpacerStyles = makeStylesHook(() => ({
  spacer: {
    marginTop: '1rem'
  }
}));

/** ============================ Components ================================ */
const Spacer: React.FC = () => {
  const classes = useSpacerStyles();
  return <div className={classes.spacer} />;
};

const LoginCard: React.FC = () => {
  const classes = useLoginCardStyles();
  
  // Component state
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState(false);
  
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
            name="email"
            onChange={setEmail}
            outlined
          />
          
          <Spacer />
          
          <TextField
            autoComplete="current-password"
            className={classes.loginField}
            error={error}
            helperText={error ? 'Invalid email or password' : ' '}
            id="outlined-secondary"
            label="Password"
            name="password"
            onChange={setPassword}
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
  async function onSubmit (event: React.FormEvent) {
    setError(false);
    event.preventDefault();
    
    let response;
    try {
      response = await api.login(email, password);
    } catch (e) {
      setError(true);
      return;
    }

    if (!response.ok) {
      setError(true);
    }
  }
};

export const LoginPage: React.FC = () => {
  const classes = useStyles();
  const gradientClasses = classNames(
    classes.gradient,
    Branding.useGradientStyles().root
  );
  
  return (
    <Flex.Container alignItems="stretch" className={classes.container}>
      <Flex.Container
        alignItems="center"
        className={gradientClasses}
        direction="column"
        justifyContent="center"
      >
        <Typography variant="h2" className={classes.navigader}>
          NAVIGADER
        </Typography>
      </Flex.Container>
      
      <LoginCard />
    </Flex.Container>
  );
};
