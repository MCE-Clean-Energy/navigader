/**
 * Defines all Lodash methods that are exposed to the application. Consuming code should import
 * the methods like so:
 *
 *   import _ from 'navigader/util/lodash';
 *
 * Note that we cherry-pick methods for smaller webpack bundles.
 */
import defaults from 'lodash/defaults';
import every from 'lodash/every';
import filter from 'lodash/filter';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import findLast from 'lodash/findLast';
import flatten from 'lodash/flatten';
import groupBy from 'lodash/groupBy';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import map from 'lodash/map';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import padEnd from 'lodash/padEnd';
import pick from 'lodash/pick';
import pickBy from 'lodash/pickBy';
import range from 'lodash/range';
import some from 'lodash/some';
import sortBy from 'lodash/sortBy';
import sumBy from 'lodash/sumBy';
import toPairs from 'lodash/toPairs';
import without from 'lodash/without';


export default {
  defaults,
  every,
  filter,
  find,
  findIndex,
  findLast,
  flatten,
  groupBy,
  isArray,
  isEmpty,
  isUndefined,
  map,
  merge,
  omit,
  padEnd,
  pick,
  pickBy,
  range,
  some,
  sortBy,
  sumBy,
  toPairs,
  without
};
