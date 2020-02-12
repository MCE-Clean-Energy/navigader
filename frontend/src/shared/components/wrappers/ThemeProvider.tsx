import React from 'react';
import MuiThemeProvider from '@material-ui/styles/ThemeProvider';
import { ThemeProvider as JssThemeProvider } from 'react-jss'

import theme from '../../styles';

/** ============================ Components ================================ */
const ThemeProvider: React.FC = props =>
  <MuiThemeProvider theme={theme}>
    <JssThemeProvider theme={theme}>
      {props.children}
    </JssThemeProvider>
  </MuiThemeProvider>;

/** ============================ Exports =================================== */
export default ThemeProvider;
