/**
 * Takes a value, a minimum and a maximum and returns...
 *   - the minimum, if the value is less than the minimum
 *   - the maximum, if the value is greater than the maximum
 *   - otherwise, the value
 *
 * @param {number} value: the value to clamp within the range
 * @param {number} min: the lower end of the range
 * @param {number} max: the upper end of the range
 */
export function clamp (value: number, min: number, max: number) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Basic linear interpolation. Calculates a number between two numbers at a specific increment. The
 * `amt` parameter is the amount to interpolate between the two values where 0 is equal to the lower
 * end of the range, 0.1 is very near the lower end, 0.5 is half-way in between, 1 is equal to the
 * upper limit of the range, etc.
 *
 * @param {number} amount: amount to interpolate within the range. Typically between 0 and 1
 * @param {number} lower: the lower end of the range
 * @param {number} upper: the upper end of the range
 *
 * @returns {float}
 */
export function lerp (amount: number, lower: number, upper: number) {
  return ((upper - lower) * amount) + lower;
}

/**
 * Returns what percent of `denominator` the `numerator` is
 *
 *   ex: percentage(0, 5)    ==> 0
 *   ex: percentage(1, 2)    ==> 50
 *   ex: percentage(3.5, 2)  ==> 175
 *
 * @param {number} numerator: the X in "X is what percent of Y?"
 * @param {number} denominator: the X in "Y is what percent of Y?"
 */
export function percentOf (numerator: number, denominator: number) {
  if (denominator === 0) return Infinity;
  return 100 * numerator / denominator;
}

/**
 * Performs the basic XOR function on an arbitrary number of arbitrary inputs
 *
 * @param {any[]} args: all the operands
 */
export function xor (...args: any[]) {
  return args.filter(arg => Boolean(arg)).length === 1;
}
