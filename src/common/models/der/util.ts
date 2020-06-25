import { BatteryStrategy } from 'navigader/types';


/**
 * Retrieves and formats the strategy's description. The automated descriptions list their entire
 * charge and discharge schedules for every month, beginning with January. We remove that because
 * it makes the text overly-complex to read
 *
 * @param {BatteryStrategy} strategy: the strategy to retrieve and format the description of
 */
export function getStrategyDescription (strategy: BatteryStrategy) {
  const contentEnd = strategy.description.indexOf('January');
  return contentEnd === -1
    ? strategy.description
    : strategy.description.slice(0, contentEnd).trim();
}
