import { DeferrableFields } from './api';
import { NavigaderObject, Nullable, ProgressFields, RawPandasFrame } from './common';
import { BatteryConfiguration, BatteryStrategy } from './der';
import { LoadTypeMap, MeterGroup } from './meter';


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
type ProcurementKeys =
  | 'PRC_LMP2018Delta'
  | 'PRC_LMP2018PostDER'
  | 'PRC_LMP2018PreDER'
  | 'PRC_LMP2019Delta'
  | 'PRC_LMP2019PostDER'
  | 'PRC_LMP2019PreDER';

type AggregatedProcurementKeys =
  | 'PRC_LMPDelta'
  | 'PRC_LMPPostDER'
  | 'PRC_LMPPreDER';

export type ProcurementReport = { [key in ProcurementKeys]?: number; };
type AggregatedProcurementReport = { [Key in AggregatedProcurementKeys]: number; };

type DetailedReport = {
  DERConfiguration: string;
  DERStrategy: string;
  SimulationRatePlan: string;
  SingleScenarioStudy: string;
};

type UsageReport = {
  UsagePreDER: number;
  UsagePostDER: number;
  UsageDelta: number;
};

type BillReport = {
  BillPreDER: Nullable<number>;
  BillPostDER: Nullable<number>;
  BillDelta: Nullable<number>;
};

type GHGReport = {
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
};

type CustomerMeterReport = {
  MeterRatePlan: string;
};

type ResourceAdequacyReport = {
  RAPreDER: Nullable<number>;
  RAPostDER: Nullable<number>;
  RADelta: Nullable<number>;
};

type ScenarioReportFieldsCommon = { ID: string; } & DetailedReport & Partial<
  & UsageReport
  & BillReport
  & GHGReport
  & ResourceAdequacyReport
  & ProcurementReport
  & CustomerMeterReport
>;

export type RawScenarioReportFields = ScenarioReportFieldsCommon & { "SA ID": number; };
export type ScenarioReportFields =
  & ScenarioReportFieldsCommon
  & AggregatedProcurementReport
  & { SA_ID: number; };

export type EmptyReport = { index: {}; };
export type RawScenarioReport = RawPandasFrame<RawScenarioReportFields>;
export type ScenarioReport = {
  [id: string]: ScenarioReportFields;
};

export type ScenarioReportSummaryFields = Omit<
  ScenarioReportFieldsCommon,
  'ID' | 'SingleScenarioStudy' | 'SimulationRatePlan' | 'MeterRatePlan'
> & AggregatedProcurementReport;

type EmptyReportSummary = {};
export type RawScenarioReportSummary = { 0: ScenarioReportSummaryFields };
export type ScenarioReportSummary = ScenarioReportSummaryFields;
