import flatten from 'lodash/flatten';
import identity from 'lodash/identity';
import pick from 'lodash/pick';
import * as d3 from 'd3-scale';

import { Scenario } from 'navigader/models/scenario';
import { omitFalsey } from 'navigader/util';
import { LARGEST_RADIUS, SMALLEST_RADIUS } from './constants';
import { CustomerWrapper, ScenarioWrapper } from './dataWrappers';
import { AggregationState, ChartData, ChartDatumWrapper, SizingOption } from './types';

/**
 * Produces configuration for rendering the comparison chart. This includes the domain of the
 * chart, the domain's padding and the sizing function.
 *
 * @param {Scenario[]} scenarios: the scenarios being compared
 * @param {SizingOption} sizingMethod: enum indicating how the scenario points should be sized
 * @param {AggregationState} aggregationState: whether or not the chart is showing aggregated data
 */
export function buildChartConfiguration (
  scenarios: Scenario[],
  sizingMethod: SizingOption,
  aggregationState: AggregationState
): ChartData {
  const isAggregated = aggregationState === 'aggregated';
  
  // These are set in the data loop
  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;
  
  // When aggregating, scenarios are the unit of data; when disaggregating the simulations are
  // the unit of data
  const wrappedData: ChartDatumWrapper[] = isAggregated
    ? scenarios.map(s => new ScenarioWrapper(s))
    : flatten(
        scenarios.map(
          s => Object.values(s.report!.rows).map(row => new CustomerWrapper(row))
        )
      );
  
  // Get the size values up front-- the pixel sizes will be computed relative to one another
  const sizeValues = wrappedData.map(d => Math.abs(d.getSize(sizingMethod)));
  const sizeScale = isAggregated
    ? d3.scaleSqrt()
        .domain([0, Math.max(...sizeValues)])
        .range([SMALLEST_RADIUS, LARGEST_RADIUS])
    : identity;
  
  const data = omitFalsey(wrappedData.map((datum, i) => {
    // Check if the xValue and yValue are the new min or max of their respective axes
    const xValue = datum.getBillDelta();
    const yValue = datum.getGhgDelta();
    if (xValue < xMin) xMin = xValue;
    if (xValue > xMax) xMax = xValue;
    if (yValue < yMin) yMin = yValue;
    if (yValue > yMax) yMax = yValue;
    
    // Compute the datum's size metric
    const sizeValue = sizeValues[i];
    const size = sizeScale(sizeValue) as number;
    
    return {
      ...pick(datum, ['name']),
      label: datum.getLabel(),
      scenario: datum.getScenarioId(),
      size,
      sizeValue,
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
