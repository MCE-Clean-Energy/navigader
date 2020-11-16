import { DERStrategy, GHGRate, SolarArrayType } from 'navigader/types';

/**
 * Retrieves and formats the strategy's description. The automated descriptions list their entire
 * DER schedules for every month, beginning with January. We remove that because it makes the text
 * overly-complex to read
 *
 * @param {DERStrategy} strategy: the strategy to retrieve and format the description of
 */
export function getStrategyDescription(strategy: DERStrategy) {
  if (!strategy.description) return;
  const contentEnd = strategy.description.indexOf('January');
  return contentEnd === -1
    ? strategy.description
    : strategy.description.slice(0, contentEnd).trim();
}

/**
 * Renders the a GHG rate name. The Clean Net Short rates all have the same name, so they must be
 * disambiguated.
 *
 * @param {GHGRate} rate: the GHG rate object to render
 */
export function renderGHGRate(rate: GHGRate) {
  if (rate.name !== 'Clean Net Short') return rate.name;

  // CNS rates get special attention because their names don't include the year
  const yearRegex = /^(?<year>\d{4})-\d{2}-\d{2}/;
  const regexMatch = rate.effective.match(yearRegex);
  const year = regexMatch?.groups?.year;

  return year ? `${rate.name} ${year}` : rate.name;
}

export function renderSolarArrayType(type: SolarArrayType) {
  switch (type) {
    case 0:
      return 'Open Rack';
    case 1:
      return 'Roof Mounted';
  }
}
