import * as React from 'react';
import MuiThemeProvider from '@material-ui/styles/ThemeProvider';

import theme from '@nav/shared/styles';


/** ============================ Components ================================ */
export const ThemeProvider: React.FC = props =>
  <MuiThemeProvider theme={theme}>
    {props.children}
  </MuiThemeProvider>;
