import { DeferrableFields } from 'navigader/api/util';
import { NavigaderObject, PandasFrame, ProgressFields, RawPandasFrame } from 'navigader/models';
import { BatteryConfiguration, BatteryStrategy } from 'navigader/models/der';
import { LoadTypeMap, MeterGroup } from 'navigader/models/meter';
import { Nullable } from 'navigader/types';


/** ============================ Scenarios ================================= */
export type DerInfo = {
  der_configuration: BatteryConfiguration;
  der_strategy: BatteryStrategy;
};

type ScenarioCommon = {
  data: Partial<LoadTypeMap>;
  der_simulation_count: number;
  expected_der_simulation_count: number;
  metadata: ScenarioMetadata;
  meter_count: number;
  name: string;
};

type ScenarioMetadata = {
  start: string;
  end_limit: string;
  der_strategy: string;
  der_configuration: string;
  id: string;
  rate_plan_name: string;
};

export type RawScenario = DeferrableFields<
  NavigaderObject<'SingleScenarioStudy'> & ScenarioCommon,
  
  // Fields that can be requested but which are not included by default
  {
    der_simulations: string[];
    ders: [DerInfo];
    meters: string[];
    meter_groups: [string];
    report: RawScenarioReport | EmptyReport;
    report_summary: RawScenarioReportSummary | EmptyReportSummary;
  }
>;

export interface Scenario extends DeferrableFields<
  NavigaderObject<'SingleScenarioStudy'> &
  ScenarioCommon &
  ProgressFields &
  {
    progress: {
      is_complete?: boolean;
      has_run: boolean;
    }
  },
  
  // Fields that can be requested but which are not included by default
  {
    der_simulations: string[];
    der: DerInfo;
    meters: string[];
    meter_group: MeterGroup;
    report: ScenarioReport;
    report_summary: ScenarioReportSummary;
  }
> {}

/** ============================ Report ==================================== */
type ScenarioReportFieldsCommon = {
  ID: string;
  
  // "Detailed report" attributes
  DERConfiguration: string;
  DERStrategy: string;
  SimulationRatePlan: string;
  SingleScenarioStudy: string;
} & Partial<{
  // "Usage report" attributes
  UsagePreDER: number;
  UsagePostDER: number;
  UsageDelta: number;
  
  // "Bill report" attributes
  BillPreDER: Nullable<number>;
  BillPostDER: Nullable<number>;
  BillDelta: Nullable<number>;
  
  // "GHG report" attributes
  CleanNetShort2018PreDER: Nullable<number>;
  CleanNetShort2018PostDER: Nullable<number>;
  CleanNetShort2018Delta: Nullable<number>;
  CleanNetShort2022PreDER: Nullable<number>;
  CleanNetShort2022PostDER: Nullable<number>;
  CleanNetShort2022Delta: Nullable<number>;
  CleanNetShort2026PreDER: Nullable<number>;
  CleanNetShort2026PostDER: Nullable<number>;
  CleanNetShort2026Delta: Nullable<number>;
  CleanNetShort2030PreDER: Nullable<number>;
  CleanNetShort2030PostDER: Nullable<number>;
  CleanNetShort2030Delta: Nullable<number>;
  CARBUnspecifiedPower2013PreDER: Nullable<number>;
  CARBUnspecifiedPower2013PostDER: Nullable<number>;
  CARBUnspecifiedPower2013Delta: Nullable<number>;
  
  // "Resource adequacy report" attributes
  RAPreDER: Nullable<number>;
  RAPostDER: Nullable<number>;
  RADelta: Nullable<number>;
  
  // "Customer meter report" attributes
  MeterRatePlan: string;
}>;

export type RawScenarioReportFields = ScenarioReportFieldsCommon & { "SA ID": number; };
export type ScenarioReportFields = ScenarioReportFieldsCommon & { SA_ID: number; };

export type EmptyReport = { index: {}; };
export type RawScenarioReport = RawPandasFrame<RawScenarioReportFields>;
export type ScenarioReport = {
  columns: PandasFrame<ScenarioReportFields>;
  rows: {
    [id: string]: ScenarioReportFields;
  };
};

type ScenarioReportSummaryFields = Omit<
  ScenarioReportFieldsCommon,
  'ID' | 'SingleScenarioStudy' | 'SimulationRatePlan' | 'MeterRatePlan'
>;

type EmptyReportSummary = {};
export type RawScenarioReportSummary = { 0: ScenarioReportSummaryFields };
export type ScenarioReportSummary = ScenarioReportSummaryFields;
