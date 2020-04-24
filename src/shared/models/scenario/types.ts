import { DeferrableFields } from '@nav/shared/api/util';
import { BatteryConfiguration, BatteryStrategy } from '@nav/shared/models/der';
import { LoadTypeMap, MeterGroup } from '@nav/shared/models/meter';
import { NavigaderObject, PandasFrame, RawPandasFrame } from '@nav/shared/types';


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
    report: RawScenarioReport;
    report_summary: RawScenarioReportSummary;
  }
>;

export interface Scenario extends DeferrableFields<
  NavigaderObject<'SingleScenarioStudy'> &
  ScenarioCommon &
  {
    progress: {
      is_complete: boolean;
      percent_complete: number;
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
  
  // "Usage report" attributes
  UsagePreDER: number;
  UsagePostDER: number;
  UsageDelta: number;
  
  // "Bill report" attributes
  BillPreDER: number;
  BillPostDER: number;
  BillDelta: number;
  
  // "GHG report" attributes
  CleanNetShort2018PreDER: number;
  CleanNetShort2018PostDER: number;
  CleanNetShort2018Delta: number;
  CleanNetShort2022PreDER: number;
  CleanNetShort2022PostDER: number;
  CleanNetShort2022Delta: number;
  CleanNetShort2026PreDER: number;
  CleanNetShort2026PostDER: number;
  CleanNetShort2026Delta: number;
  CleanNetShort2030PreDER: number;
  CleanNetShort2030PostDER: number;
  CleanNetShort2030Delta: number;
  CARBUnspecifiedPower2013PreDER: number;
  CARBUnspecifiedPower2013PostDER: number;
  CARBUnspecifiedPower2013Delta: number;
  
  // "Resource adequacy report" attributes
  RAPreDER?: number;
  RAPostDER?: number;
  RADelta?: number;
  
  // "Customer meter report" attributes
  MeterRatePlan: string;
};

export type RawScenarioReportFields = ScenarioReportFieldsCommon & { "SA ID": number; };
export type ScenarioReportFields = ScenarioReportFieldsCommon & { SA_ID: number; };

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

type RawScenarioReportSummary = { 0: ScenarioReportSummaryFields };
export type ScenarioReportSummary = ScenarioReportSummaryFields;
