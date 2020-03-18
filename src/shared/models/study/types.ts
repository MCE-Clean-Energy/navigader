import {
  NavigaderObject, PandasFrame, RawNavigaderObject, RawPandasFrame
} from '@nav/shared/types';


/** ============================ MultiScenarioStudy ======================== */
export type RawMultiScenarioStudy = RawNavigaderObject<'MultiScenarioStudy'> & {
  der_simulations: string[];
  metadata: {
    single_scenario_studies: string[]
  };
  meter_count: number;
  meters: string[];
  meter_groups: string[];
  report: RawStudyReport;
};

export type MultiScenarioStudy = NavigaderObject<'MultiScenarioStudy'> & {
  derSimulations: string[];
  metadata: {
    singleScenarioStudies: string[]
  };
  meterCount: number;
  meterGroups: string[];
  meters: string[];
  report: StudyReport;
};

/** ============================ Report ==================================== */
type StudyReportFields = {
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

export type RawStudyReport = RawPandasFrame<StudyReportFields & { 'SA ID': number; }>;
export type StudyReport = PandasFrame<StudyReportFields & { saId: number; }>;
