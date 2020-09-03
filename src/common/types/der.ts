import { DeferrableFields } from './api';
import { NavigaderObject } from './common';
import { Frame288NumericType, Frame288Type } from './data';


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
type BatteryCommonFields = { der_type: 'Battery'; };
export interface BatteryConfiguration extends DeferrableFields<
  NavigaderObject<'BatteryConfiguration'> & DERCommonFields & BatteryCommonFields,
  {
    data: {
      rating: number
      discharge_duration_hours: number;
      efficiency: number;
    };
  }
> {}

type BatteryStrategyFrame288 = Frame288Type<number | 'inf' | '-inf'>;
export interface BatteryStrategy extends DeferrableFields<
  NavigaderObject<'BatteryStrategy'> & DERStrategyCommonFields & BatteryCommonFields,
  {
    data: {
      charge_schedule_frame: BatteryStrategyFrame288;
      discharge_schedule_frame: BatteryStrategyFrame288;
    };
  }
> {}

/** ============================ EVSE ====================================== */
type EVSECommonFields = { der_type: 'EVSE'; };
export interface EVSEConfiguration extends DeferrableFields<
  NavigaderObject<'EVSEConfiguration'> & DERCommonFields & EVSECommonFields,
  {
    data: {
      ev_mpkwh: number;
      ev_mpg_eq: number;
      ev_capacity: number;
      ev_efficiency: number;
      evse_rating: number;
      ev_count: number;
      evse_count: number;
    }
  }
> {}

export interface EVSEStrategy extends DeferrableFields<
  NavigaderObject<'EVSEStrategy'> & DERStrategyCommonFields & EVSECommonFields,
  {
    data: {
      charge_schedule_frame: BatteryStrategyFrame288;
      drive_schedule_frame: Frame288NumericType;
    };
  }
> {}

/** ============================ Solar ===================================== */
type SolarCommonFields = { der_type: 'SolarPV'; };
export interface SolarConfiguration extends DeferrableFields<
  NavigaderObject<'SolarPVConfiguration'> & DERCommonFields & SolarCommonFields,
  { data: {} }
> {}

export interface SolarStrategy extends DeferrableFields<
  NavigaderObject<'SolarPVStrategy'> & DERStrategyCommonFields & SolarCommonFields,
  { data: {} }
> {}
