import { BatteryConfiguration, BatteryStrategy } from '@nav/shared/models/der';
import { MeterGroup } from '@nav/shared/models/meter';
import {
  DeferrableFields, NavigaderObject, PandasFrame, RawNavigaderObject, RawPandasFrame
} from '@nav/shared/types';


/** ============================ Scenarios ================================= */
export type DerInfo = {
  der_configuration: BatteryConfiguration;
  der_strategy: BatteryStrategy;
};

// Fields that can be requested but which are not included by default
export type DeferrableScenarioFields =
  | 'der'
  | 'ders'
  | 'der_simulations'
  | 'meters'
  | 'meter_group'
  | 'meter_groups'
  | 'report';

type ScenarioCommon = {
  der_simulation_count: number;
  der_simulations: string[];
  expected_der_simulation_count: number;
  metadata: ScenarioMetadata;
  meter_count: number;
  meters: string[];
};

type ScenarioMetadata = {
  start: string;
  end_limit: string;
  der_strategy: string;
  der_configuration: string;
  id: string;
  rate_plan_name: string;
};

export type RawScenario<T extends DeferrableScenarioFields = never> =
  DeferrableFields<
    RawNavigaderObject<'SingleScenarioStudy'> &
    ScenarioCommon &
    {
      ders: [DerInfo];
      meter_groups: [string];
      report: RawScenarioReport;
    },
    DeferrableScenarioFields,
    T
  >;

export type Scenario<T extends DeferrableScenarioFields = never> =
  DeferrableFields<
    NavigaderObject<'SingleScenarioStudy'> &
    ScenarioCommon &
    {
      der: DerInfo;
      meter_group: MeterGroup;
      progress: {
        is_complete: boolean;
        percent_complete: number;
      }
      report: ScenarioReport;
    },
    DeferrableScenarioFields,
    T
  >;

/** ============================ Report ==================================== */
type ScenarioReportFields = {
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
  
  // "Customer meter report" attributes
  MeterRatePlan?: string;
  // "SA ID": number belongs here too, but is renamed during parsing
};

export type RawScenarioReport = RawPandasFrame<ScenarioReportFields & { 'SA ID': number; }>;
export type ScenarioReport = PandasFrame<ScenarioReportFields & { sa_id: number; }>;
