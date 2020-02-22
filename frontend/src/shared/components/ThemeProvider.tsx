import React from 'react';
import MuiThemeProvider from '@material-ui/styles/ThemeProvider';
import { ThemeProvider as JssThemeProvider } from 'react-jss'

import theme from '@nav/shared/styles';


/** ============================ Components ================================ */
export const ThemeProvider: React.FC = props =>
  <MuiThemeProvider theme={theme}>
    <JssThemeProvider theme={theme}>
      {props.children}
    </JssThemeProvider>
  </MuiThemeProvider>;
