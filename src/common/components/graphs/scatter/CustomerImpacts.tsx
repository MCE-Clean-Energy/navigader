import * as React from 'react';

import { ColorMap } from 'navigader/styles';
import { Scenario, ScenarioReportFields } from 'navigader/types';
import { formatters } from 'navigader/util';
import _ from 'navigader/util/lodash';
import { ScatterPlot } from './ScatterPlot';
import { ScatterPlotDatumWrapper } from './types';



/** ============================ Types ===================================== */
type CustomerImpactGraphProps = {
  colorMap: ColorMap;
  highlight?: string;
  scenarios: Scenario[];
};

/** ============================ Data ====================================== */
class CustomerWrapper implements ScatterPlotDatumWrapper {
  customer: ScenarioReportFields;

  constructor (customer: ScenarioReportFields) {
    this.customer = customer;
  }

  get colorId () {
    return this.getScenarioId();
  }

  getBillImpact () {
    return this.customer.BillDelta;
  }

  getGhgImpact () {
    return this.customer.CleanNetShort2022Delta;
  }

  getId () {
    // The customer is unique in the context of the scenario
    return [this.getScenarioId(), this.customer.ID].join('__');
  }

  getTooltipText () {
    // `getTooltipText` is only called when the scenario is rendered, which only happens if the bill and
    // GHG impacts are numeric
    const billImpact = this.getBillImpact() as number;
    const ghgImpact = formatters.maxDecimals(this.getGhgImpact() as number, 2);

    return [
      `SA ID: ${this.customer.SA_ID}`,
      `${formatters.dollars(billImpact)}/year`,
      `${ghgImpact} ${formatters.pluralize('ton', ghgImpact)} CO2/year`
    ].map(s => formatters.truncateAtLength(s, 50)).join('\n');
  }

  getScenarioId () {
    return this.customer.SingleScenarioStudy;
  }

  getSize () {
    return 3;
  }
}

/** ============================ Components ================================ */
export const CustomerImpacts: React.FC<CustomerImpactGraphProps> = (props) => {
  const { colorMap, highlight, scenarios } = props;
  const data = _.flatten(
    scenarios.map(s => Object.values(s.report!).map(row => new CustomerWrapper(row)))
  );

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
