import * as React from 'react';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import useTheme from '@material-ui/core/styles/useTheme';

import { primaryColor, secondaryColor } from './colors';


/** ============================ Theme ===================================== */
// Extend the default theme
declare module '@material-ui/core/styles/createMixins' {
  type TransitionBounds = [any, any];
  interface Mixins {
    transition: {
      (property: string, activated: boolean, bounds: TransitionBounds): React.CSSProperties
    }
  }
}

export const theme = createMuiTheme({
  mixins: {
    transition: (property, activated, bounds) => ({
      transition: `${property} 0.25s`,
      [property]: activated ? bounds[0] : bounds[1]
    })
  },
  palette: {
    primary: {
      main: primaryColor
    },
    secondary: {
      main: secondaryColor
    }
  }
});

export type Theme = typeof theme;
export { useTheme };
