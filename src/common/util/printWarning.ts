import { isProduction } from './isProduction';

/**
 * Prints a warning message when in dev mode
 *
 * @param {string} msg: the message to print
 * @param {any[]} args: additional arguments to include in the warning message
 */
export function printWarning(msg: string, ...args: any[]) {
  if (!isProduction()) {
    console.warn(msg, ...args);
  }
}
