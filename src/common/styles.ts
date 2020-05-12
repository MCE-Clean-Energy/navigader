import * as React from 'react';
import { Color as MuiColor } from '@material-ui/core';
import * as muiColors from '@material-ui/core/colors';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import useTheme from '@material-ui/core/styles/useTheme';
import createStyles from '@material-ui/styles/createStyles';
import makeStyles from '@material-ui/styles/makeStyles';
import { ClassNameMap, StyleRules } from '@material-ui/styles/withStyles';
import omit from 'lodash/omit';


/** ============================ Theme ===================================== */
export const primaryColor = '#EC0B88';
export const secondaryColor = '#F8B367';

// Extend the default theme
declare module '@material-ui/core/styles/createMixins' {
  type TransitionBounds = [any, any];
  interface Mixins {
    transition: {
      (property: string, activated: boolean, bounds: TransitionBounds): React.CSSProperties
    }
  }
}

const theme = createMuiTheme({
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

export default theme;
export type Theme = typeof theme;
export { useTheme };

/** ============================ Styles Hook =============================== */
export function makeStylesHook<Props extends {} = {}, ClassKey extends string = string> (
  styles: (theme: Theme) => StyleRules<Props, ClassKey>,
  name: string
): (props?: Props) => ClassNameMap<ClassKey> {
  return makeStyles<Theme>(
    createStyles(styles),
    { name }
  );
}

/** ============================ Colors ==================================== */
export type Color = MuiColor;
export type MaterialColor =
  | 'amber'
  | 'blue'
  | 'blueGrey'
  | 'brown'
  | 'cyan'
  | 'deepOrange'
  | 'deepPurple'
  | 'green'
  | 'grey'
  | 'indigo'
  | 'lightBlue'
  | 'lightGreen'
  | 'lime'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'teal'
  | 'yellow';

export const materialColors: Record<MaterialColor, Color> = omit(muiColors, 'common');
