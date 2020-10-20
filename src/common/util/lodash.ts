/**
 * Defines all Lodash methods that are exposed to the application. Consuming code should import
 * the methods like so:
 *
 *   import _ from 'navigader/util/lodash';
 *
 * Note that we cherry-pick methods for smaller webpack bundles.
 */
import clone from 'lodash/clone';
import defaults from 'lodash/defaults';
import every from 'lodash/every';
import filter from 'lodash/filter';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import findLast from 'lodash/findLast';
import flatten from 'lodash/flatten';
import fromPairs from 'lodash/fromPairs';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import includes from 'lodash/includes';
import isArray from 'lodash/isArray';
import isDate from 'lodash/isDate';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
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
import zip from 'lodash/zip';


const _ = {
  clone,
  defaults,
  every,
  filter,
  find,
  findIndex,
  findLast,
  flatten,
  fromPairs,
  get,
  groupBy,
  includes,
  isArray,
  isDate,
  isEmpty,
  isEqual,
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
  without,
  zip
};

export default _;
