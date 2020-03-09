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
