/**
 * Prints a warning message when in dev mode
 *
 * @param {string} msg: the message to print
 */
export function printWarning (msg: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(msg);
  }
}
