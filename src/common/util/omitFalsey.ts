import { _ } from 'navigader/util';


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
 * Filters an array of values to non-falsey values
 *
 * @param {object} arr: the array to filter falsey values from
 */
export function omitFalsey <T>(arr: Array<T | Falsey>): Array<T>;

/**
 * Takes an object of values and returns all of the key-value pairs in that object that aren't
 * falsey
 *
 * @param {object} obj: the object to filter falsey values from
 */
export function omitFalsey <T>(obj: Record<string, T | Falsey>): Record<string, T>;

export function omitFalsey (arrayOrObject: any) {
  return Array.isArray(arrayOrObject)
    ? arrayOrObject.filter(notFalsey)
    : _.pickBy(arrayOrObject, notFalsey);
}

/** ============================ Helpers ===================================== */
function notFalsey <T>(x: T | Falsey): x is T {
  return Boolean(x);
}
