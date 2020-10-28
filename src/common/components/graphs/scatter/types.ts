import { ScenarioImpactColumn, ScenarioReportSummaryFields } from 'navigader/types';

export type ScatterConfig = {
  data: ScatterDatum[];
  domain: {
    x: [number, number];
    y: [number, number];
  };
};

export type DatumCoordinateValue = number | null | undefined;
export type DatumLabelFunction = (n: number) => string;

export interface ScatterPlotDatumWrapper {
  readonly datum: ScenarioReportSummaryFields;
  readonly colorId: any;
  readonly x: DatumCoordinateValue;
  readonly y: DatumCoordinateValue;
  readonly id: string;
  readonly tooltipText: string;
  readonly size: number;

  getImpact(axis: ScenarioImpactColumn): [DatumCoordinateValue, DatumLabelFunction];
}

export type ScatterDatum = {
  color: string;
  id: string;
  tooltip: string;
  size: number;
  xValue: number;
  yValue: number;
};
