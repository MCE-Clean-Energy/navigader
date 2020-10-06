import { DeferrableFields } from './api';
import { NavigaderObject, Nullable, ProgressFields, RawPandasFrame } from './common';
import { DataObject, RawDataObject } from './data';
import { DERConfiguration, DERStrategy } from './der';
import { MeterGroup } from './meter';


/** ============================ Scenarios ================================= */
export type ScenarioImpactColumn = 'Usage' | 'GHG' | 'Revenue' | 'Procurement' | 'RA';
type DERInfo = {
  der_configuration: DERConfiguration;
  der_strategy: DERStrategy;
};

type ScenarioCommon = {
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
  NavigaderObject<'Scenario'> & ScenarioCommon & RawDataObject<'kw'>,

  // Fields that can be requested but which are not included by default
  {
    der_simulations: string[];
    ders: [DERInfo];
    meters: string[];
    meter_group: string;
    report: RawScenarioReport | EmptyReport;
    report_summary: RawScenarioReportSummary | EmptyReportSummary;
  }
>;

export interface Scenario extends DeferrableFields<
  NavigaderObject<'Scenario'> &
  ScenarioCommon &
  ProgressFields &
  DataObject &
  {
    meter_group_id?: string;
    progress: {
      has_run: boolean;
    }
  },

  // Fields that can be requested but which are not included by default
  {
    der_simulations: string[];
    der: DERInfo;
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

export type AggregatedProcurementKeys =
  | 'PRC_LMPDelta'
  | 'PRC_LMPPostDER'
  | 'PRC_LMPPreDER';

export type ProcurementReport = { [key in ProcurementKeys]?: number; };
type AggregatedProcurementReport = { [Key in AggregatedProcurementKeys]: number; };

type UsageReport = {
  UsagePreDER: number;
  UsagePostDER: number;
  UsageDelta: number;
};

type FinancialReport = {
  BillRevenuePreDER: Nullable<number>;
  BillRevenuePostDER: Nullable<number>;
  BillRevenueDelta: Nullable<number>;
  ExpensePreDER?: number;
  ExpensePostDER?: number;
  ExpenseDelta?: number;
  ProfitPreDER?: number;
  ProfitPostDER?: number;
  ProfitDelta?: number;
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

type ScenarioReportFieldsCommon = { ID: string; ScenarioID: string; } & Partial<
  & UsageReport
  & FinancialReport
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

type RawScenarioReportSummaryFields = Omit<
  ScenarioReportFieldsCommon,
  'ID' | 'ScenarioID' | 'SimulationRatePlan' | 'MeterRatePlan'
>;
export type ScenarioReportSummaryFields =
  & RawScenarioReportSummaryFields
  & AggregatedProcurementReport;

type EmptyReportSummary = {};
export type RawScenarioReportSummary = { 0: RawScenarioReportSummaryFields };
export type ScenarioReportSummary = ScenarioReportSummaryFields;
