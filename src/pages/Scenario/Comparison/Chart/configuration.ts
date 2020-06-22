import { Scenario } from 'navigader/types';
import { omitFalsey } from 'navigader/util';
import _ from 'navigader/util/lodash';
import { CustomerWrapper, ScenarioWrapper } from './dataWrappers';
import { ChartData, ChartDatumWrapper } from './types';

/**
 * Produces configuration for rendering the comparison chart. This includes the domain of the
 * chart, the domain's padding and the sizing function.
 *
 * @param {Scenario[]} scenarios: the scenarios being compared
 * @param {boolean} isAggregated: whether or not the chart is showing aggregated data
 * @param {boolean} isAveraged: whether or not to show the per customer values
 */
export function buildChartConfiguration (
  scenarios: Scenario[],
  isAggregated: boolean,
  isAveraged: boolean
): ChartData {
  // These are set in the data loop
  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;
  
  // When aggregating, scenarios are the unit of data; when disaggregating the simulations are
  // the unit of data
  const wrappedData: ChartDatumWrapper[] = isAggregated
    ? scenarios.map(s => new ScenarioWrapper(s))
    : _.flatten(
        scenarios.map(
          s => Object.values(s.report!.rows).map(row => new CustomerWrapper(row))
        )
      );
  
  const data = omitFalsey(wrappedData.map((datum, i) => {
    const xValue = datum.getBillImpact(isAveraged);
    const yValue = datum.getGhgImpact(isAveraged);
    
    // If the xValue or yValue are `null` don't render this point
    if (typeof xValue !== 'number' || typeof yValue !== 'number') return null;
    
    // Check if the xValue and yValue are the new min or max of their respective axes
    if (xValue < xMin) xMin = xValue;
    if (xValue > xMax) xMax = xValue;
    if (yValue < yMin) yMin = yValue;
    if (yValue > yMax) yMax = yValue;
    
    return {
      ..._.pick(datum, ['name']),
      id: datum.getId(),
      label: datum.getLabel(isAveraged),
      scenario: datum.getScenarioId(),
      size: datum.getSize(),
      xValue,
      yValue
    };
  }));
  
  // To center the origin in the graph, the axes extend equally on both sides
  const xMaxAbsolute = Math.max(Math.abs(xMin), Math.abs(xMax));
  const yMaxAbsolute = Math.max(Math.abs(yMin), Math.abs(yMax));
  
  return {
    data,
    domain: {
      x: [-xMaxAbsolute, xMaxAbsolute],
      y: [-yMaxAbsolute, yMaxAbsolute]
    }
  };
}
