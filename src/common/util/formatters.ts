import moment from 'moment';

import { Nullable } from 'navigader/types';
import { clamp, percentOf } from './math';


/** ============================ Types ===================================== */
type DateType = Date | string;
type DollarFormatOptions = Partial<{
  cents: boolean;
}>;

/** ============================ Formatters ================================ */
/**
 * When given a number `n` and a maximum number of decimal digits to print, returns the number `n`
 * rounded such that it has at most the number of decimal digits. No trailing zeroes will be
 * included. If a non-number `n` is passed in, returns `null`.
 *
 * @param {number} [n]: the number to format. This is made optional to support cases where the
 *   number may be undefined
 * @param {number} maxDecimals: the maximum number of decimals to include
 */
export function maxDecimals (n: number, maxDecimals: number): number;
export function maxDecimals (n: any, maxDecimals: number): Nullable<number>;
export function maxDecimals (n: any, maxDecimals: number) {
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

/**
 * Renders a number as a dollar amount, adding commas and a dollar sign. Cents are omitted by
 * default, but can be added. If the amt falls between -1 and 1, decimals will be included unless
 * specifically told to omit them.
 *
 * @param {number} amt: the dollar amount to render
 * @param {DollarFormatOptions} [options]: optional options
 */
export function dollars (amt: number | undefined | null, options?: DollarFormatOptions) {
  if (amt === undefined || amt === null) return;
  
  const roundsToOne = [-1, 1].includes(+amt.toFixed(2));
  const lessThanOne = clamp(amt, -1, 1) === amt && !roundsToOne;
  const addDecimals = (options && options.cents) || (lessThanOne && !options?.cents);
  const amtFixed = parseFloat(amt.toFixed(addDecimals ? 2 : 0));
  const roundedTowardsZero = amtFixed >= 0 ? Math.floor(amtFixed) : Math.ceil(amtFixed);
  const wholeDollars = Math.abs(roundedTowardsZero).toString().split('');
  
  let dollarString = '';
  wholeDollars.reverse().forEach((integer, i) => {
    // Every 3 digits we insert a comma
    if (i === 0 || i % 3 !== 0) {
      dollarString = integer + dollarString;
    } else {
      dollarString = integer + ',' + dollarString;
    }
  });
  
  // Append the cents unless omitted
  if (addDecimals) {
    let decimalString = amtFixed.toFixed(2).split('.')[1];
    if (decimalString && decimalString.length === 1) decimalString += '0';
    dollarString += '.' + decimalString;
  }
  
  // Add a minus sign if negative
  const prefix = amtFixed < 0 ? '-' : '';
  return prefix + '$' + dollarString;
}

/**
 * Truncates a string at a given length, replacing the rest of the string with an ellipsis
 *
 * @param {string} str: the string to (potentially) truncate
 * @param {number} numChars: the number of characters to truncate at
 */
export function truncateAtLength (str: string | undefined, numChars: number) {
  if (!str) return;
  return str.length > numChars
    ? str.slice(0, numChars) + '...'
    : str;
}
