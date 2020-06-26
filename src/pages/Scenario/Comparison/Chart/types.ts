export type ScenarioDatum = {
  id: string;
  tooltip: string;
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
  getTooltipText: (averaged: boolean) => string;
  getScenarioId: () => string;
  getSize: () => number;
}
