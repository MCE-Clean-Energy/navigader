import { Scenario, ScenarioReportFields, ScenarioReportSummary } from 'navigader/types';
import { omitFalsey } from 'navigader/util';
import { dollars, maxDecimals, pluralize, truncateAtLength  } from 'navigader/util/formatters';
import { ChartDatumWrapper } from './types';


export class ScenarioWrapper implements ChartDatumWrapper {
  reportSummary: ScenarioReportSummary;
  scenario: Scenario;
  
  constructor (scenario: Scenario) {
    this.reportSummary = scenario.report_summary!;
    this.scenario = scenario;
  }
  
  getBillImpact (averaged: boolean) {
    const billImpact = this.reportSummary.BillDelta;
    return averaged && typeof billImpact === 'number'
      ? billImpact / this.scenario.meter_count
      : billImpact;
  }
  
  getGhgImpact (averaged: boolean) {
    const ghgImpact = this.reportSummary.CleanNetShort2022Delta;
    return averaged && typeof ghgImpact === 'number'
      ? ghgImpact / this.scenario.meter_count
      : ghgImpact;
  }
  
  getId () {
    return this.scenario.id;
  }
  
  getTooltipText (averaged: boolean) {
    const { der, expected_der_simulation_count, meter_group, name } = this.scenario;
    
    // `getTooltipText` is only called when the scenario is rendered, which only happens if the bill and
    // GHG impacts are numeric
    const billImpact = this.getBillImpact(averaged) as number;
    const ghgImpact = maxDecimals(this.getGhgImpact(averaged) as number, 2);
    
    const averagedSuffix = averaged ? '/SAID' : '';
    return omitFalsey([
      name,
      der?.der_configuration.name,
      der?.der_strategy.name,
      meter_group?.name,
      `${expected_der_simulation_count} ${pluralize('customer', expected_der_simulation_count)}`,
      `${dollars(billImpact)}/year${averagedSuffix}`,
      `${ghgImpact} ${pluralize('ton', ghgImpact)} CO2/year${averagedSuffix}`
    ]).map(s => truncateAtLength(s, 50)).join('\n');
  }

  getScenarioId () {
    return this.scenario.id;
  }
  
  getSize () {
    return 15;
  }
}

export class CustomerWrapper implements ChartDatumWrapper {
  customer: ScenarioReportFields;
  
  constructor (customer: ScenarioReportFields) {
    this.customer = customer;
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
    const ghgImpact = maxDecimals(this.getGhgImpact() as number, 2);
    
    return [
      `SA ID: ${this.customer.SA_ID}`,
      `${dollars(billImpact)}/year`,
      `${ghgImpact} ${pluralize('ton', ghgImpact)} CO2/year`
    ].map(s => truncateAtLength(s, 50)).join('\n');
  }
  
  getScenarioId () {
    return this.customer.SingleScenarioStudy;
  }
  
  getSize () {
    return 3;
  }
}
