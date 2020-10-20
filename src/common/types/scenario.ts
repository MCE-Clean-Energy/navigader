import { NavigaderObject, Nullable, ProgressFields, RawPandasFrame } from './common';
import { DERConfiguration, DERStrategy } from './der';
import { AbstractMeterGroup, AbstractRawMeterGroup, OriginFile, RawOriginFile } from './meter';


/** ============================ Meter Groups ============================== */
export type RawMeterGroup = RawOriginFile | RawScenario;
export type MeterGroup = OriginFile | Scenario;

/** ============================ Scenarios ================================= */
export type ScenarioImpactColumn =
  | 'Usage'
  | 'GHG'
  | 'Procurement'
  | 'RA'
  | 'Revenue'
  | 'Expense'
  | 'Profit';

type DERInfo = {
  der_configuration: DERConfiguration;
  der_strategy: DERStrategy;
};

type ScenarioMetadata = {
  start: string;
  end_limit: string;
  der_strategy: string;
  der_configuration: string;
  is_complete: boolean;
};

export type RawScenario =
  & AbstractRawMeterGroup
  & NavigaderObject<'Scenario'>
  & {
    der_simulation_count: number;
    expected_der_simulation_count: number;
    metadata: ScenarioMetadata;
  }

  // Fields that can be requested but which are not included by default
  & Partial<{
    der_simulations: string[];
    ders: [DERInfo];
    meter_group: string;
    report: RawScenarioReport | EmptyReport;
    report_summary: RawScenarioReportSummary | EmptyReportSummary;
  }>;

export type Scenario =
  & AbstractMeterGroup
  & Omit<RawScenario, 'data' | 'date_range' | 'ders' | 'meter_group' | 'report' | 'report_summary'>
  & ProgressFields
  & { meter_group_id?: string }

  // Fields that can be requested but which are not included by default
  & Partial<{
    der: DERInfo;
    meter_group: MeterGroup;
    report: ScenarioReport;
    report_summary: ScenarioReportSummary;
  }>;

/** ============================ Report ==================================== */
export type ProcurementReport = { [key in ProcurementKeys]?: number; };
type ProcurementKeys =
  | 'ProcurementDelta'
  | 'ProcurementPostDER'
  | 'ProcurementPreDER';

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
  GHGPreDER: Nullable<number>;
  GHGPostDER: Nullable<number>;
  GHGDelta: Nullable<number>;
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
  & { SA_ID: number; };

export type EmptyReport = { index: {}; };
export type RawScenarioReport = RawPandasFrame<RawScenarioReportFields>;
export type ScenarioReport = {
  [id: string]: ScenarioReportFields;
};

export type ScenarioReportSummaryFields = Omit<
  ScenarioReportFieldsCommon,
  'ID' | 'ScenarioID' | 'SimulationRatePlan' | 'MeterRatePlan'
>;

type EmptyReportSummary = {};
export type RawScenarioReportSummary = { 0: ScenarioReportSummaryFields };
export type ScenarioReportSummary = ScenarioReportSummaryFields;
