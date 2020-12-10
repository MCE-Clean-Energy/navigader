import { NavigaderObject } from './common';
import { Frame288NumericType, Frame288Type } from './data';

export type DERInfo = { der_configuration: DERConfiguration; der_strategy: DERStrategy };
export type DERConfiguration = BatteryConfiguration | EVSEConfiguration | SolarConfiguration;
export type DERStrategy = BatteryStrategy | EVSEStrategy | SolarStrategy;
export type DERType = DERConfiguration['der_type'];
export type DERStrategyType =
  | 'load_flattening'
  | 'reduce_bill'
  | 'reduce_ghg'
  | 'reduce_cca_finance'
  | null;

type DERCommonFields = {
  id: string;
  name: string;
  created_at: string;
};

type DERStrategyCommonFields = DERCommonFields & {
  description?: string;
  objective?: DERStrategyType;
};

/** ============================ Battery =================================== */
type BatteryCommonFields = { der_type: 'Battery' };
export interface BatteryConfiguration
  extends NavigaderObject<'BatteryConfiguration'>,
    DERCommonFields,
    BatteryCommonFields {
  data?: {
    rating: number;
    discharge_duration_hours: number;
    efficiency: number;
  };
}

type BatteryStrategyFrame288 = Frame288Type<number | 'inf' | '-inf'>;
export interface BatteryStrategy
  extends NavigaderObject<'BatteryStrategy'>,
    DERStrategyCommonFields,
    BatteryCommonFields {
  data?: {
    charge_schedule_frame: BatteryStrategyFrame288;
    discharge_schedule_frame: BatteryStrategyFrame288;
  };
}

/** ============================ EVSE ====================================== */
type EVSECommonFields = { der_type: 'EVSE' };
export interface EVSEConfiguration
  extends NavigaderObject<'EVSEConfiguration'>,
    DERCommonFields,
    EVSECommonFields {
  data?: {
    ev_mpkwh: number;
    ev_count: number;
    evse_count: number;
    evse_rating: number;
    evse_utilization: number;
  };
}

export interface EVSEStrategy
  extends NavigaderObject<'EVSEStrategy'>,
    DERStrategyCommonFields,
    EVSECommonFields {
  data?: {
    charge_schedule_frame: BatteryStrategyFrame288;
    drive_schedule_frame: Frame288NumericType;
  };
}

/** ============================ Solar ===================================== */
type SolarCommonFields = { der_type: 'SolarPV' };
export type SolarArrayType = 0 | 1;
export interface SolarConfiguration
  extends NavigaderObject<'SolarPVConfiguration'>,
    DERCommonFields,
    SolarCommonFields {
  data?: {
    address: string;
    array_type: SolarArrayType;
    azimuth: number; // 0 <= value < 360
    tilt: number; // 0 <= value <= 90
  };
}

export interface SolarStrategy
  extends NavigaderObject<'SolarPVStrategy'>,
    DERStrategyCommonFields,
    SolarCommonFields {
  data?: {
    serviceable_load_ratio: number; // 0 < value
  };
}
