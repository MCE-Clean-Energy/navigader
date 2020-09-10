export type ScatterConfig = {
  data: ScatterDatum[];
  domain: {
    x: [number, number];
    y: [number, number];
  };
};

export interface ScatterPlotDatumWrapper {
  colorId: any;
  getBillImpact: () => number | null | undefined;
  getGhgImpact: () => number | null | undefined;
  getId: () => string;
  getTooltipText: () => string;
  getSize: () => number;
}

export type ScatterDatum = {
  color: string;
  id: string;
  tooltip: string;
  size: number;
  xValue: number;
  yValue: number;
};
