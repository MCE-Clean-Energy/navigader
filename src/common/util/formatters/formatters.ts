import _ from 'lodash';
import { DateTime, DateTimeFormatOptions, LocaleOptions } from 'luxon';

import { Maybe, Nullable, Tuple } from 'navigader/types';
import { clamp, percentOf } from '../data';
import { parseDate } from '../serializers';

/** ============================ Types ===================================== */
type DollarFormatOptions = Partial<{ cents: boolean }>;
type DateFormatterInput = Date | string;

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
export function maxDecimals(n: number, maxDecimals: number): number;
export function maxDecimals(n: any, maxDecimals: number): Nullable<number>;
export function maxDecimals(n: any, maxDecimals: number) {
  return typeof n === 'number' ? parseFloat(n.toFixed(maxDecimals)) : null;
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
export function getMonthName(monthIndex: number) {
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
    'December',
  ];

  return months[monthIndex - 1];
}

/**
 * Utility methods for formatting dates consistently in the application. This will largely just be a
 * wrapper around Luxon
 */
const wrapDate = (d: DateFormatterInput) => (_.isDate(d) ? d : parseDate(d));
const formatDate = (d: DateFormatterInput, format: LocaleOptions & DateTimeFormatOptions) =>
  DateTime.fromJSDate(wrapDate(d)).toLocaleString(format);
export const date = {
  monthDayHourMinute: (date: DateFormatterInput) =>
    formatDate(date, {
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      month: 'short',
    }),
  standard: (date: DateFormatterInput) => formatDate(date, DateTime.DATE_MED),
  range: (dates: Tuple<DateFormatterInput>, fn: (d: DateFormatterInput) => string) =>
    `${fn(dates[0])} - ${fn(dates[1])}`,
};

/**
 * Pluralizes a word based on the `count` parameter
 *
 * @param {string} singularForm: the singular form of the word. This will be returned if `count`
 *   is equal to 1
 * @param {number} count: the number used for the inflection
 * @param {string} [pluralForm]: the manually provided plural form. If not provided, this will
 *   be inferred according to rules described below
 */
export function pluralize(singularForm: string, count: number, pluralForm?: string) {
  if (count === 1) return singularForm;

  // The plural form is determined crudely. If the word ends in `y`, its plural form will end
  // with `ies`. Otherwise the plural form is inferred to be the singular form plus `s`. Many
  // English words will fail here (e.g. `octopus` --> `octopi`). For such cases we have the
  // `pluralForm` fallback
  if (pluralForm) return pluralForm;

  const endsInYRegex = /^(?<wordMinusY>[a-zA-Z]+)y$/;
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
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Provided a numerator and a denominator, returns what percent of the denominator the numerator is.
 * If either the numerator or denominator is undefined, returns `null`
 *
 *   ex: percentage(0, 5)    ==> 0%
 *   ex: percentage(1, 2)    ==> 50%
 *   ex: percentage(3.5, 2)  ==> 175%
 *
 * @param {number|undefined} numerator: the number the percent will be derived for
 * @param {number|undefined} denominator: the number the percent will be derived from
 * @param {number} [n = 0]: the number of digits to round to
 */
export function percentage(numerator: Maybe<number>, denominator: Maybe<number>, n: number = 0) {
  if (_.isUndefined(numerator) || _.isUndefined(denominator)) return null;
  const percent = percentOf(numerator, denominator);
  return percent === Infinity ? 'Infinity' : maxDecimals(percent, n) + '%';
}

/**
 * Renders a number as a dollar amount, adding commas and a dollar sign. Cents are omitted by
 * default, but can be added. If the amt falls between -1 and 1, decimals will be included unless
 * specifically told to omit them.
 *
 * @param {number} amt: the dollar amount to render
 * @param {DollarFormatOptions} [options]: optional options
 */
export function dollars(amt: number | undefined | null, options?: DollarFormatOptions) {
  if (amt === undefined || amt === null) return;

  const roundsToOne = [-1, 1].includes(+amt.toFixed(2));
  const lessThanOne = clamp(amt, -1, 1) === amt && !roundsToOne;
  const addDecimals = (options && options.cents) || (lessThanOne && !options?.cents);
  const amtFixed = parseFloat(amt.toFixed(addDecimals ? 2 : 0));
  const roundedTowardsZero = amtFixed >= 0 ? Math.floor(amtFixed) : Math.ceil(amtFixed);
  let dollarString = commas(Math.abs(roundedTowardsZero));

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
export function truncateAtLength(str: Maybe<string>, numChars: number) {
  if (!str) return;
  return str.length > numChars ? str.slice(0, numChars) + '...' : str;
}

/**
 * Adds commas to a number at every 3 digits. If a non-number `n` is passed in, returns `null`.
 *
 * @param {number} [n]: the number to format. This is made optional to support cases where the
 *   number may be undefined/null
 */
export function commas(n: number): string;
export function commas(n: any): Nullable<string>;
export function commas(n: any) {
  if (typeof n !== 'number') return null;

  const isNegative = n < 0;
  const roundedTowardsZero = isNegative ? Math.ceil(n) : Math.floor(n);
  const integerDigits = Math.abs(roundedTowardsZero).toString().split('');

  let integerStr = '';
  integerDigits.reverse().forEach((integer, i) => {
    // Every 3 digits we insert a comma
    if (i === 0 || i % 3 !== 0) {
      integerStr = integer + integerStr;
    } else {
      integerStr = integer + ',' + integerStr;
    }
  });

  // Add the decimals back in
  const nStr = n.toString();
  const decimalIndex = nStr.indexOf('.');
  const decimals = decimalIndex === -1 ? '' : nStr.slice(decimalIndex);
  const sign = isNegative ? '-' : '';
  return [sign, integerStr, decimals].join('');
}

/**
 * Renderes the Filesize (in Bytes) to an easily human readable format.
 *
 * @param {number} [size]: Number of bytes.
 */

const units = ['byte', 'KB', 'MB', 'GB'];
const maxIndex = units.length - 1;

export function fileSize(size: number) {
  if (size <= 0) return '';

  let power = Math.floor(Math.log(size) / Math.log(1000));
  if (power > maxIndex) {
    power = maxIndex;
  }

  const val = size / Math.pow(1000, power);

  let suffix;
  if (power === 0) {
    // If the power is 0, we may pluralize the unit ("byte" vs "bytes")
    suffix = val === 1 ? 'byte' : 'bytes';
  } else {
    suffix = units[power];
  }

  return `${parseFloat(val.toFixed(1))} ${suffix}`;
}
