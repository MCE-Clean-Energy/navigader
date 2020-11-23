import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import useTheme from '@material-ui/core/styles/useTheme';

import { primaryColor, secondaryColor } from './colors';

/** ============================ Theme ===================================== */
export const theme = createMuiTheme({
  mixins: {
    border: ({ color, radius = 0, width = 1 }) => ({
      borderWidth: width,
      borderStyle: 'solid',
      borderColor: color,
      borderRadius: radius,
    }),
    flex: ({ direction, wrap, justify, align }) => ({
      alignItems: align,
      display: 'flex',
      flexDirection: direction,
      flexWrap: wrap,
      justifyContent: justify,
    }),
    transition: (property, activated, bounds) => ({
      transition: `${property} 0.25s`,
      [property]: activated ? bounds[0] : bounds[1],
    }),
  },
  palette: {
    primary: {
      main: primaryColor,
    },
    secondary: {
      main: secondaryColor,
    },
  },
  typography: {
    fontSize: 16,
  },
});

export type Theme = typeof theme;
export { useTheme };
