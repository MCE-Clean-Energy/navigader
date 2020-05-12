import { Scenario, ScenarioReportFields, ScenarioReportSummary } from 'navigader/models/scenario';
import { formatters } from 'navigader/util';
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
    return averaged && billImpact !== null
      ? billImpact / this.scenario.meter_count
      : billImpact;
  }
  
  getGhgImpact (averaged: boolean) {
    const ghgImpact = this.reportSummary.CleanNetShort2022Delta;
    return averaged && ghgImpact !== null
      ? ghgImpact / this.scenario.meter_count
      : ghgImpact;
  }
  
  getId () {
    return this.scenario.id;
  }
  
  getLabel () {
    const { expected_der_simulation_count, meter_group, name } = this.scenario;
    const billImpactPerCustomer = this.getSize();
    const ghgDeltaPerCustomer = this.getSize();

    return [
      name,
      meter_group?.name,
      `${expected_der_simulation_count} ${formatters.pluralize('customer', expected_der_simulation_count)}`,
      `${formatters.dollars(billImpactPerCustomer)}/year per customer`,
      `${formatters.maxDecimals(ghgDeltaPerCustomer, 2)} ${formatters.pluralize('ton', ghgDeltaPerCustomer)} CO2/year per customer`
    ].join('\n');
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
    return `SA ID: ${this.customer.SA_ID}`;
  }
  
  getScenarioId () {
    return this.customer.SingleScenarioStudy;
  }
  
  getSize () {
    return 3;
  }
}
