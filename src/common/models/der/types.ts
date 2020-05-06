import { DeferrableFields } from 'navigader/api/util';
import { NavigaderObject } from 'navigader/models';
import { Frame288Type, MeterDataField } from 'navigader/models/meter';
import { ScenarioReportFields } from 'navigader/models/scenario';


export type DerType = 'Battery' | 'Solar Panel';

/** ============================ Battery =================================== */
type DerConfigurationDeferrableFields = {
  data: {
    rating: number
    discharge_duration_hours: number;
    efficiency: number;
  };
};

type DerCommonFields = {
  der_type: 'Battery';
  name: string;
}

export interface BatteryConfiguration extends DeferrableFields<
  NavigaderObject<'BatteryConfiguration'> & DerCommonFields,
  DerConfigurationDeferrableFields
> {}

type Frame288BatteryStrategy = Frame288Type<number | 'inf' | '-inf'>;
type DerStrategyDeferredFields = {
  data: {
    charge_schedule_frame: Frame288BatteryStrategy;
    discharge_schedule_frame: Frame288BatteryStrategy;
  };
};

export interface BatteryStrategy extends DeferrableFields<
  NavigaderObject<'BatteryStrategy'> & DerCommonFields,
  DerStrategyDeferredFields
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
