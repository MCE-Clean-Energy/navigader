import _ from 'lodash';
import * as muiColors from '@material-ui/core/colors';
import { Color as MuiColor } from '@material-ui/core';

/** ============================ Colors ==================================== */
export const primaryColor = '#EC0B88';
export const secondaryColor = '#F8B367';
export const white = '#FFFFFF';

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

export const materialColors: Record<MaterialColor, Color> = _.omit(muiColors, 'common');

/**
 * Utility class to provide "color maps" in the application. This is most often useful within data
 * visualization contexts. Calling code can provide an entity-- an object, function, any primitive
 * etc. --and will receive an associated color. This association will last for the lifetime of the
 * map
 */
export class ColorMap {
  private mapping: Map<any, string>;

  /**
   * Constructor. Creates new `ColorMap` objects
   *
   * @param {any[]} [initialElements]: initial elements to populate the color map with. This can be
   *   useful in circumstances where the entries are ordered but the order in which they render
   *   is inconsistent
   */
  constructor(initialElements?: any[]) {
    this.mapping = new Map();

    if (initialElements) {
      initialElements.forEach((element) => this.setColor(element));
    }
  }

  /**
   * Returns the color for a given map entry, creating a new one for the entry if it has not yet
   * been entered into the map
   *
   * @param {any} entry: the entity whose color the map will retrieve/create
   */
  getColor(entry: any): string {
    if (this.mapping.has(entry)) {
      return this.mapping.get(entry)!;
    } else {
      return this.setColor(entry);
    }
  }

  /**
   * Sets a color for the given entry
   *
   * @param {any} entry: the entity to be associated with a color
   */
  private setColor(entry: any) {
    const colorKey = mapColors[this.mapping.size % mapColors.length];
    const color = materialColors[colorKey][700];
    this.mapping.set(entry, color);
    return color;
  }
}

const mapColors = Object.keys(materialColors).sort() as Array<keyof typeof materialColors>;
