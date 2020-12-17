import { DERStrategy, SolarArrayType } from 'navigader/types';

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

export function renderSolarArrayType(type: SolarArrayType) {
  switch (type) {
    case 0:
      return 'Open Rack';
    case 1:
      return 'Roof Mounted';
  }
}
