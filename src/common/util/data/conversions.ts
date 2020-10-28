/**
 * Converts kW to MW
 *
 * @param {number} kw: the kW value to convert
 */
export function kwToMw(kw: number | undefined | null) {
  if (kw === undefined || kw === null) return undefined;
  return kw / 1000;
}
