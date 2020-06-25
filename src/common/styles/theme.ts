import * as React from 'react';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import useTheme from '@material-ui/core/styles/useTheme';
import { VictoryThemeDefinition } from 'victory-core';
import { VictoryTheme } from 'victory';

import _ from 'navigader/util/lodash';
import { materialColors, primaryColor, secondaryColor } from './colors';


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

/** ============================ Victory charts ============================ */
export const tooltipShadowId = 'tooltip-drop-shadow';

// Colors
const blueGrey50 = materialColors.blueGrey[50];
const blueGrey300 = materialColors.blueGrey[300];
const blueGrey700 = materialColors.blueGrey[700];

// Labels
const baseLabelStyles = {
  fontFamily: "'Roboto', 'Helvetica Neue', Helvetica, sans-serif",
  fontSize: 14,
  letterSpacing: 'normal',
  padding: 8,
  fill: blueGrey700,
};

const centeredLabelStyles = { textAnchor: 'middle', ...baseLabelStyles };

// Strokes
const strokeLinecap = 'round';
const strokeLinejoin = 'round';

// Put it all together...
export const chartTheme = _.merge({}, VictoryTheme.material, {
  area: {
    style: {
      data: {
        opacity: 0.3
      }
    }
  },
  axis: {
    style: {
      axis: {
        stroke: blueGrey300,
        strokeWidth: 2,
        strokeLinecap,
        strokeLinejoin
      },
      axisLabel: {
        ...centeredLabelStyles,
        padding: 15
      },
      grid: {
        stroke: blueGrey50,
        strokeDasharray: '5, 5',
        strokeLinecap,
        strokeLinejoin
      },
      ticks: {
        size: 5,
        stroke: blueGrey300,
        strokeWidth: 1,
        strokeLinecap,
        strokeLinejoin
      },
      tickLabels: baseLabelStyles
    },
  },
  legend: {
    orientation: 'horizontal',
    style: {
      data: {
        type: 'circle',
        opacity: 0.5
      },
      labels: baseLabelStyles
    }
  },
  line: {
    style: {
      data: {
        opacity: 0.3,
        strokeWidth: 2
      },
      labels: centeredLabelStyles
    }
  },
  tooltip: {
    cornerRadius: 5,
    pointerLength: 10
  },
  voronoi: {
    style: {
      labels: {
        ...centeredLabelStyles,
        padding: 5,
        pointerEvents: 'none'
      },
      flyout: {
        filter: `url(#${tooltipShadowId})`,
        fontSize: 16,
        strokeWidth: 0,
        fill: materialColors.grey[200],
        pointerEvents: 'none'
      }
    }
  }
}) as VictoryThemeDefinition;
