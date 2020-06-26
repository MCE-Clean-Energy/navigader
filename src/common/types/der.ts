import { DeferrableFields } from './api';
import { NavigaderObject } from './common';
import { Frame288Type } from './frame288';
import { MeterDataField } from './meter';


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
    description?: string;
    objective: DerStrategyType;
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
};
