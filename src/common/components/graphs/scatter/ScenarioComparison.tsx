import * as React from 'react';

import { ColorMap } from 'navigader/styles';
import { Scenario, ScenarioReportSummary } from 'navigader/types';
import { formatters, omitFalsey } from 'navigader/util';
import { ScatterPlot } from './ScatterPlot';
import { ScatterPlotDatumWrapper } from './types';



/** ============================ Types ===================================== */
type ScenarioComparisonProps = {
  averaged: boolean;
  colorMap: ColorMap;
  highlight?: string;
  scenarios: Scenario[];
};

/** ============================ Data ====================================== */
class ScenarioWrapper implements ScatterPlotDatumWrapper {
  reportSummary: ScenarioReportSummary;
  scenario: Scenario;
  averaged: boolean;

  constructor (scenario: Scenario, averaged: boolean) {
    this.reportSummary = scenario.report_summary!;
    this.scenario = scenario;
    this.averaged = averaged;
  }

  get colorId () {
    return this.getId();
  }

  getBillImpact () {
    const billImpact = this.reportSummary.BillDelta;
    return this.averaged && typeof billImpact === 'number'
      ? billImpact / this.scenario.meter_count
      : billImpact;
  }

  getGhgImpact () {
    const ghgImpact = this.reportSummary.CleanNetShort2022Delta;
    return this.averaged && typeof ghgImpact === 'number'
      ? ghgImpact / this.scenario.meter_count
      : ghgImpact;
  }

  getId () {
    return this.scenario.id;
  }

  getTooltipText () {
    const { der, expected_der_simulation_count: expected_count, meter_group, name } = this.scenario;

    // `getTooltipText` is only called when the scenario is rendered, which only happens if the bill
    // and GHG impacts are numeric
    const billImpact = this.getBillImpact() as number;
    const ghgImpact = formatters.maxDecimals(this.getGhgImpact() as number, 2);

    const averagedSuffix = this.averaged ? '/SAID' : '';
    return omitFalsey([
      name,
      der?.der_configuration.name,
      der?.der_strategy.name,
      meter_group?.name,
      `${expected_count} ${formatters.pluralize('customer', expected_count)}`,
      `${formatters.dollars(billImpact)}/year${averagedSuffix}`,
      `${ghgImpact} ${formatters.pluralize('ton', ghgImpact)} CO2/year${averagedSuffix}`
    ]).map(s => formatters.truncateAtLength(s, 50)).join('\n');
  }

  getSize () {
    return 15;
  }
}

/** ============================ Components ================================ */
export const ScenarioComparison: React.FC<ScenarioComparisonProps> = (props) => {
  const { averaged, colorMap, highlight, scenarios } = props;
  const data = scenarios.map(s => new ScenarioWrapper(s, averaged));
  return (
    <ScatterPlot
      colorMap={colorMap}
      data={data}
      highlight={highlight}
      xAxisLabel="Revenue Impacts ($/year)"
      yAxisLabel="GHG Impacts (tCO2/year)"
    />
  );
};
