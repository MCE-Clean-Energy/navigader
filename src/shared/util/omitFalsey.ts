import pickBy from 'lodash/pickBy';


/** ============================ Types ===================================== */
/**
 * This is meant to capture all values in JS that evaluate to `false` when passed through the
 * Boolean constructor. This is incomplete, and perhaps impossible to do with TypeScript because
 * there are some language values which types can't capture. For example, the type of `NaN` is
 * `number`, yet `Boolean(NaN) === false`.
 */
export type Falsey = false | 0 | '' | null | undefined;

/** ============================ Method ==================================== */
/**
 * Takes an object of values and returns all of the key-value pairs in that object that aren't
 * falsey
 *
 * @param {object} obj: the object to filter falsey values from
 */
export function omitFalsey <T>(obj: Record<string, T | Falsey>) {
  return pickBy(obj, notFalsey);
}

/** ============================ Helpers ===================================== */
function notFalsey <T>(x: T | Falsey): x is T {
  return Boolean(x);
}
