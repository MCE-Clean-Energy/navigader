import { IdType } from 'navigader/types';


export type ScenarioDatum = {
  scenario: IdType;
  label: string;
  xValue: number;
  yValue: number;
  
  // `size` is a pixel value used by Victory to size the points; `sizeValue` is the value
  // computed from the scenario that was used to derive `size`
  size: number;
  sizeValue: number;
};

export type ChartData = {
  data: ScenarioDatum[];
  domain: {
    x: [number, number];
    y: [number, number];
  };
}

export enum SizingOption {
  CohortSize = '# Customers',
  GHGImpactPerCustomer = 'GHG impact per customer',
  BillImpactPerCustomer = 'Bill impact per customer'
}

export type AggregationState = 'aggregated' | 'disaggregated';

export interface ChartDatumWrapper {
  getBillDelta: () => number;
  getGhgDelta: () => number;
  getLabel: () => string;
  getScenarioId: () => IdType;
  getSize: (sizingMethod: SizingOption) => number;
}
