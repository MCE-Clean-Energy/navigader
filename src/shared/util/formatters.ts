import moment from 'moment';
import { percentOf } from './math';


/** ============================ Types ===================================== */
type DateType = Date | string;

/** ============================ Formatters ================================ */
/**
 * When given a number `n` and a maximum number of decimal digits to print, returns the number `n`
 * rounded such that it has at most the number of decimal digits. No trailing zeroes will be
 * included. If no number `n` is passed in, returns `null`.
 *
 * @param {number} [n]: the number to format. This is made optional to support cases where the
 *   number may be undefined
 * @param {number} maxDecimals: the maximum number of decimals to include
 */
export function maxDecimals (n: number | undefined, maxDecimals: number) {
  return typeof n === 'number'
    ? parseFloat(n.toFixed(maxDecimals))
    : null;
}

/**
 * Returns a string representation of a month provided its "index".
 *
 * @param {number} monthIndex - The 1-indexed value of the month. That is,
 *
 *   1: January
 *   2: February
 *   ...
 *   12: December
 */
export function getMonthName (monthIndex: number) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  
  return months[monthIndex - 1];
}

/**
 * Utility method for formatting dates consistently in the application. This will largely just be a
 * wrapper around moment.js
 *
 * @param {Date object | string} date - The date to format
 */
export function standardDate (date: DateType): string {
  return moment(date).format('MMM D, YYYY');
}

/**
 * Pluralizes a word based on the `count` parameter
 *
 * @param {string} singularForm: the singular form of the word. This will be returned if `count`
 *   is equal to 1
 * @param {number} count: the number used for the inflection
 * @param {string} [pluralForm]: the manually provided plural form. If not provided, this will
 *   be inferred according to rules described below
 */
export function pluralize (singularForm: string, count: number, pluralForm?: string) {
  if (count === 1) return singularForm;
  
  // The plural form is determined crudely. If the word ends in `y`, its plural form will end
  // with `ies`. Otherwise the plural form is inferred to be the singular form plus `s`. Many
  // English words will fail here (e.g. `octopus` --> `octopi`). For such cases we have the
  // `pluralForm` fallback
  if (pluralForm) return pluralForm;
  
  const endsInYRegex =  /^(?<wordMinusY>[a-zA-Z]+)y$/;
  const match = singularForm.match(endsInYRegex);
  
  if (match && match.groups) {
    return match.groups.wordMinusY + 'ies';
  } else {
    return singularForm + 's';
  }
}

/**
 * Capitalizes a string by making the first character uppercase and the rest lowercase
 *
 * @param {string} str: the string to capitalize
 */
export function capitalize (str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Provided a numerator and a denominator, returns what percent of the denominator the numerator is.
 *
 *   ex: percentage(0, 5)    ==> 0%
 *   ex: percentage(1, 2)    ==> 50%
 *   ex: percentage(3.5, 2)  ==> 175%
 *
 * @param {number} numerator: the number the percent will be derived for
 * @param {number} denominator: the number the percent will be derived from
 * @param {number} [n = 0]: the number of digits to round to
 */
export function percentage (numerator: number, denominator: number, n: number = 0) {
  const percent = percentOf(numerator, denominator);
  return percent === Infinity
    ? 'Infinity'
    : maxDecimals(percent, n) + '%';
}
