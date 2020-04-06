import moment from 'moment';


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
