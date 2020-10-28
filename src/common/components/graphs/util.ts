/**
 * Makes the label for a chart's y-axis
 *
 * @param {string} label: the label prop provided to the component
 * @param {string} units: the units of the
 */
export function getAxisLabel(label?: string, units?: string) {
  if (!label) return;
  if (!units) return label;
  return `${label} (${units})`;
}

// Used in callback functions provided to Victory components
export type VictoryCallbackArg<T> = { datum: T };
