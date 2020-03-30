import { isProduction } from './isProduction';

/**
 * Prints a warning message when in dev mode
 *
 * @param {string} msg: the message to print
 */
export function printWarning (msg: string) {
  if (!isProduction()) {
    console.warn(msg);
  }
}
