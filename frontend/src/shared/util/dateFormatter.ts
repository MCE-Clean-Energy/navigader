import moment from 'moment';


type DateType = Date | string;

/**
 * Utility method for formatting dates consistently in the application. This will largely just be a
 * wrapper around moment.js
 *
 * @param {Date object | string} date - The date to format
 */
export function dateFormatter (date: DateType): string {
  return moment(date).format('MMM D, YYYY');
}
