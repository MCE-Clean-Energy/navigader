import { Scenario, ScenarioReportFields, ScenarioReportSummary } from 'navigader/models/scenario';
import { formatters, omitFalsey } from 'navigader/util';
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
  
  getLabel (averaged: boolean) {
    const { der, expected_der_simulation_count, meter_group, name } = this.scenario;
    
    // `getLabel` is only called when the scenario is rendered, which only happens if the bill and
    // GHG impacts are numeric
    const billImpact = this.getBillImpact(averaged) as number;
    const ghgImpact = formatters.maxDecimals(this.getGhgImpact(averaged) as number, 2);
    
    const averagedSuffix = averaged ? '/SAID' : '';
    return omitFalsey([
      name,
      der?.der_configuration.name,
      der?.der_strategy.name,
      meter_group?.name,
      `${expected_der_simulation_count} ${formatters.pluralize('customer', expected_der_simulation_count)}`,
      `${formatters.dollars(billImpact)}/year${averagedSuffix}`,
      `${ghgImpact} ${formatters.pluralize('ton', ghgImpact)} CO2/year${averagedSuffix}`
    ]).map(s => formatters.truncateAtLength(s, 50)).join('\n');
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
  
  getLabel () {
    // `getLabel` is only called when the scenario is rendered, which only happens if the bill and
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
