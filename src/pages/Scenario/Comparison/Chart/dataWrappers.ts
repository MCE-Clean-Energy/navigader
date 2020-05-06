import { Scenario, ScenarioReportFields, ScenarioReportSummary } from 'navigader/models/scenario';
import { formatters } from 'navigader/util';
import { ChartDatumWrapper, SizingOption } from './types';


export class ScenarioWrapper implements ChartDatumWrapper {
  reportSummary: ScenarioReportSummary;
  scenario: Scenario;
  
  constructor (scenario: Scenario) {
    this.reportSummary = scenario.report_summary!;
    this.scenario = scenario;
  }
  
  getBillDelta () {
    return this.reportSummary.BillDelta;
  }
  
  getGhgDelta () {
    return this.reportSummary.CleanNetShort2022Delta;
  }
  
  getLabel () {
    const { expected_der_simulation_count, meter_group, name } = this.scenario;
    const billDeltaPerCustomer = this.getSize(SizingOption.BillImpactPerCustomer);
    const ghgDeltaPerCustomer = this.getSize(SizingOption.GHGImpactPerCustomer);
    return [
      name,
      meter_group?.name,
      `${expected_der_simulation_count} ${formatters.pluralize('customer', expected_der_simulation_count)}`,
      `${formatters.dollars(billDeltaPerCustomer)}/year per customer`,
      `${formatters.maxDecimals(ghgDeltaPerCustomer, 2)} ${formatters.pluralize('ton', ghgDeltaPerCustomer)} CO2/year per customer`
    ].join('\n');
  }

  getScenarioId () {
    return this.scenario.id;
  }
  
  /**
   * Computes the size metric for the scenario. This depends upon the the sizing method
   *
   * @param {SizingOption} sizingMethod: the method by which the scenario point will be sized
   */
  getSize (sizingMethod: SizingOption) {
    const { expected_der_simulation_count } = this.scenario;
    switch (sizingMethod) {
      case SizingOption.CohortSize:
        return expected_der_simulation_count;
      case SizingOption.GHGImpactPerCustomer:
        return this.reportSummary.CleanNetShort2022Delta / expected_der_simulation_count;
      case SizingOption.BillImpactPerCustomer:
        return this.reportSummary.BillDelta / expected_der_simulation_count;
    }
  }
}

export class CustomerWrapper implements ChartDatumWrapper {
  customer: ScenarioReportFields;
  
  constructor (customer: ScenarioReportFields) {
    this.customer = customer;
  }
  
  getBillDelta () {
    return this.customer.BillDelta;
  }
  
  getGhgDelta () {
    return this.customer.CleanNetShort2022Delta;
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
