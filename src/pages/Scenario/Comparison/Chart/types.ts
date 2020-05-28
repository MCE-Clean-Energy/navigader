export type ScenarioDatum = {
  id: string;
  label: string;
  scenario: string;
  size: number;
  xValue: number;
  yValue: number;
};

export type ChartData = {
  data: ScenarioDatum[];
  domain: {
    x: [number, number];
    y: [number, number];
  };
}

export interface ChartDatumWrapper {
  getBillImpact: (averaged: boolean) => number | null | undefined;
  getGhgImpact: (averaged: boolean) => number | null | undefined;
  getId: () => string;
  getLabel: (averaged: boolean) => string;
  getScenarioId: () => string;
  getSize: () => number;
}
