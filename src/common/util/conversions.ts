/**
 * Converts kW to MW
 *
 * @param {number} kw: the kW value to convert
 */
export function kwToMw (kw: number | undefined) {
  if (kw === undefined) return undefined;
  return kw / 1000;
}
