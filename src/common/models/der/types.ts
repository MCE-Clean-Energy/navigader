import { DeferrableFields } from 'navigader/api/util';
import { NavigaderObject } from 'navigader/models';
import { Frame288Type, MeterDataField } from 'navigader/models/meter';
import { ScenarioReportFields } from 'navigader/models/scenario';


export type DerType = 'Battery';
type DerConfigurationDeferrableFields = {
  data: {
    rating: number
    discharge_duration_hours: number;
    efficiency: number;
  };
};

export type DerStrategyType =
  | 'load_flattening'
  | 'reduce_bill'
  | 'reduce_ghg'
  | 'reduce_cca_finance'
  | null;

type DerCommonFields = {
  der_type: 'Battery';
  name: string;
}

/** ============================ Battery =================================== */
export interface BatteryConfiguration extends DeferrableFields<
  NavigaderObject<'BatteryConfiguration'> & DerCommonFields,
  DerConfigurationDeferrableFields
> {}

type BatteryStrategyFrame288 = Frame288Type<number | 'inf' | '-inf'>;
type BatteryStrategyDeferredFields = {
  data: {
    charge_schedule_frame: BatteryStrategyFrame288;
    discharge_schedule_frame: BatteryStrategyFrame288;
  };
};

export interface BatteryStrategy extends DeferrableFields<
  NavigaderObject<'BatteryStrategy'> & DerCommonFields & {
    description: string; objective: DerStrategyType;
  }, BatteryStrategyDeferredFields
> {}

/** ============================ DER Simulations =========================== */
export type BatterySimulation = NavigaderObject<'StoredBatterySimulation'> & {
  data: MeterDataField;
  der_columns: string[];
  der_configuration: string;
  der_strategy: string;
  end_limit: string;
  meter: string;
  start: string;
  
  // This isn't included in the server response, must be loaded separately with the scenario
  report?: ScenarioReportFields
};
