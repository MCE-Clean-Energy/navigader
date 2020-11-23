import _ from 'lodash';
import * as React from 'react';

import { ColorMap } from 'navigader/styles';
import {
  Maybe,
  Scenario,
  ScenarioImpactColumn,
  ScenarioReportFields,
  ScenarioReportSummaryFields,
} from 'navigader/types';
import { formatters, omitFalsey } from 'navigader/util';
import { ScatterPlot } from './ScatterPlot';
import { getAxisLabel, ScenarioComparisonChartAxes } from './ScenarioComparisonAxes';
import { DatumCoordinateValue, DatumLabelFunction, ScatterPlotDatumWrapper } from './types';

/** ============================ Types ===================================== */
type ScenarioComparisonProps = {
  aggregated: boolean;
  averaged?: boolean;
  axes: ScenarioComparisonChartAxes;
  colorMap: ColorMap;
  highlight?: string;
  scenarios: Scenario[];
};

/** ============================ Data ====================================== */
class DatumWrapper<Datum extends ScenarioReportSummaryFields = ScenarioReportSummaryFields> {
  axes: ScenarioComparisonChartAxes;
  datum: Datum;

  constructor(datum: Datum, axes: ScenarioComparisonChartAxes) {
    this.axes = axes;
    this.datum = datum;
  }

  get x() {
    return this.getImpact(this.axes[0])[0];
  }
  get y() {
    return this.getImpact(this.axes[1])[0];
  }

  // Child classes can choose to render additional tooltip info
  protected get extraTooltipFields(): Array<Maybe<string>> {
    return [];
  }

  get tooltipText() {
    const [xAxis, yAxis] = this.axes;

    // `getTooltipText` is only called when the scenario is rendered, which only happens if the
    // x- and y-values are numeric
    const [x, xFormatter] = this.getImpact(xAxis);
    const [y, yFormatter] = this.getImpact(yAxis);

    return omitFalsey([
      ...this.extraTooltipFields,
      xAxis + ' Impact: ' + xFormatter(formatters.maxDecimals(x as number, 2)),
      yAxis + ' Impact: ' + yFormatter(formatters.maxDecimals(y as number, 2)),
    ])
      .map((s) => formatters.truncateAtLength(s, 50))
      .join('\n');
  }

  getImpact(axis: ScenarioImpactColumn): [DatumCoordinateValue, DatumLabelFunction] {
    const { datum } = this;

    // Formatters
    const dollarFormatter: DatumLabelFunction = (n) => `${formatters.dollars(n)}/year`;
    const ghgFormatter: DatumLabelFunction = (n) =>
      `${formatters.commas(n)} ${formatters.pluralize('ton', n)} CO2/year`;
    const usageFormatter: DatumLabelFunction = (n) => `${formatters.commas(n)} kW/year`;

    switch (axis) {
      case 'Usage':
        return [datum.UsageDelta, usageFormatter];
      case 'GHG':
        return [datum.GHGDelta, ghgFormatter];
      case 'RA':
        return [datum.RADelta, dollarFormatter];
      case 'Procurement':
        return [datum.ProcurementCostDelta, dollarFormatter];
      case 'Revenue':
        return [datum.BillRevenueDelta, dollarFormatter];
      case 'Expense':
        return [datum.ExpenseDelta, dollarFormatter];
      case 'Profit':
        return [datum.ProfitDelta, dollarFormatter];
    }
  }
}

class ScenarioWrapper extends DatumWrapper implements ScatterPlotDatumWrapper {
  averaged: boolean;
  scenario: Scenario;

  constructor(scenario: Scenario, averaged: boolean, axes: ScenarioComparisonChartAxes) {
    super(scenario.report_summary!, axes);
    this.averaged = averaged;
    this.scenario = scenario;
  }

  get colorId() {
    return this.id;
  }
  get id() {
    return this.scenario.id;
  }
  get size() {
    return 15;
  }

  get extraTooltipFields() {
    const { der, expected_der_simulation_count: expected_count, meter_group, name } = this.scenario;
    return [
      name,
      der?.der_configuration.name,
      der?.der_strategy.name,
      meter_group?.name,
      `${expected_count} ${formatters.pluralize('customer', expected_count)}`,
    ];
  }

  getImpact(axis: ScenarioImpactColumn): [DatumCoordinateValue, DatumLabelFunction] {
    const { averaged, scenario } = this;

    const [impact, formatter] = super.getImpact(axis);
    const averagedSuffix = averaged ? '/SAID' : '';
    const nAveraged =
      averaged && typeof impact === 'number' ? impact / scenario.meter_count : impact;

    return [nAveraged, (m) => formatter(m) + averagedSuffix];
  }
}

class CustomerWrapper
  extends DatumWrapper<ScenarioReportFields>
  implements ScatterPlotDatumWrapper {
  get colorId() {
    return this.scenarioId;
  }
  get extraTooltipFields() {
    return [`SA ID: ${this.datum.SA_ID}`];
  }
  get scenarioId() {
    return this.datum.ScenarioID;
  }
  get size() {
    return 3;
  }

  // The customer is unique in the context of the scenario
  get id() {
    return [this.scenarioId, this.datum.ID].join('__');
  }
}

/** ============================ Components ================================ */
export const ScenarioComparison: React.FC<ScenarioComparisonProps> = (props) => {
  const { aggregated, averaged = false, axes, colorMap, highlight, scenarios } = props;
  const data = aggregated
    ? scenarios.map((s) => new ScenarioWrapper(s, averaged, axes))
    : _.flatten(
        scenarios.map((s) => Object.values(s.report!).map((row) => new CustomerWrapper(row, axes)))
      );

  return (
    <ScatterPlot
      colorMap={colorMap}
      data={data}
      highlight={highlight}
      xAxisLabel={getAxisLabel(axes[0])}
      yAxisLabel={getAxisLabel(axes[1])}
    />
  );
};
