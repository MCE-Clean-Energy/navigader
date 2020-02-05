import React from 'react';
import { ThemeProvider } from '@material-ui/core';

import theme from '../styles';

/** ============================ Components ================================ */
const NavigaderThemeProvider: React.FC = props =>
  <ThemeProvider theme={theme}>{props.children}</ThemeProvider>;

/** ============================ Exports =================================== */
export default NavigaderThemeProvider;
