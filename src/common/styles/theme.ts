import * as React from 'react';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import useTheme from '@material-ui/core/styles/useTheme';
import { CreateCSSProperties } from '@material-ui/core/styles/withStyles';

import { primaryColor, secondaryColor } from './colors';


// Flex types
export type AlignItemsValue = 'center' | 'flex-start' | 'stretch';
export type FlexDirection = 'row' | 'column';
export type WrapValue = 'wrap' | 'nowrap';
export type JustifyContentValue =
  | 'center'
  | 'flex-start'
  | 'flex-end'
  | 'space-between'
  | 'space-around';

type FlexArgs = Partial<{
  direction: FlexDirection;
  wrap: WrapValue;
  justify: JustifyContentValue;
  align: AlignItemsValue;
}>;

/** ============================ Theme ===================================== */
// Extend the default theme
declare module '@material-ui/core/styles/createMixins' {
  type TransitionBounds = [any, any];
  interface Mixins {
    flex: (args: FlexArgs) => CreateCSSProperties;

    transition:
      (property: string, activated: boolean, bounds: TransitionBounds) => React.CSSProperties;
  }
}

export const theme = createMuiTheme({
  mixins: {
    flex: ({ direction, wrap, justify, align }) => ({
      alignItems: align,
      display: 'flex',
      flexDirection: direction,
      flexWrap: wrap,
      justifyContent: justify
    }),
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
  },
  typography: {
    fontSize: 16
  }
});

export type Theme = typeof theme;
export { useTheme };
