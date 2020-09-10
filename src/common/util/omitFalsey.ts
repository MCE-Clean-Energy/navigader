import { Falsey, isTruthy } from 'navigader/types';
import _ from 'navigader/util/lodash';


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
    ? arrayOrObject.filter(isTruthy)
    : _.pickBy(arrayOrObject, isTruthy);
}
