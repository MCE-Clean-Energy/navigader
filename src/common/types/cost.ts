import { DateTime } from 'luxon';

import { NavigaderObject, Nullable, StateChoice } from './common';
import {
  DataObject,
  DateRange,
  Frame288Numeric,
  Frame288NumericType,
  RawDataObject,
  RawDateRange,
} from './data';

/** ============================ CAISO Rates =============================== */
type CAISORateFilters = Partial<{
  DATA_ITEM: 'LMP_PRC';
}>;

type CAISORateCommon = {
  filters: CAISORateFilters;
  id: number;
  name: string;
  created_at: string;
  object_type: 'CAISORate';
};

export interface CAISORate extends CAISORateCommon, DataObject, DateRange {}
export interface RawCAISORate
  extends CAISORateCommon,
    RawDataObject<'$/kwh', 'start'>,
    RawDateRange {}

/** ============================ Rate Plans ================================ */
export type LoadServingEntity = {
  id: number;
  name: string;
  short_name: string;
  state: StateChoice;
};

export type RateComponent = { rate: number; unit: string } & Partial<{
  max: number;
  adj: number;
  sell: number;
}>;

export type RateBucket = Partial<{
  energyRateTiers: RateComponent[];
  demandRateTiers: RateComponent[];
}>;

export type EnergyKeyVal = { key: string; val: number };
export type RateData = Partial<{
  approved: boolean;
  effectiveDate: { $date: string };
  rateName: string;
  sector: string;
  sourceReference: string;
  energyRateStrux: RateBucket[];
  demandRateStrux: RateBucket[];
  energyKeyVals: EnergyKeyVal[];
  demandRateUnits: string;
}>;

export type RateCollection = {
  effective_date: string;
  id: number;
  object_type: 'RateCollection';
  openei_url: Nullable<string>;
  rate_plan: RatePlan['id'];
  utility_url: string;
  rate_data: RateData;
};

type RatePlanCommon = {
  demand_max: Nullable<number>;
  demand_min: Nullable<number>;
  description: Nullable<string>;
  id: number;
  load_serving_entity: LoadServingEntity;
  name: string;
  created_at: string;
  object_type: 'RatePlan';
  rate_collections?: RateCollection[];
  sector?: string;
};

export interface RawRatePlan extends RatePlanCommon {
  start_date: Nullable<string>;
}

export interface RatePlan extends RatePlanCommon {
  start_date: Nullable<DateTime>;
}

/** ============================ GHG Rates ================================ */
export type RawGHGRate = {
  data?: Frame288NumericType;
  effective: string;
  id: number;
  name: string;
  object_type: 'GHGRate';
  rate_unit: number;
  source: string;
};

export interface GHGRate
  extends Omit<NavigaderObject<'GHGRate'>, 'created_at' | 'id'>,
    Omit<RawGHGRate, 'data' | 'effective'> {
  data?: Frame288Numeric;
  effective: Date;
}

/** ============================ System profiles ================================ */
type CommonSystemProfile = {
  id: number;
  load_serving_entity?: LoadServingEntity;
  name: string;
  created_at: string;
  object_type: 'SystemProfile';
  resource_adequacy_rate: number;
};

export interface RawSystemProfile extends RawDataObject<'kw'>, CommonSystemProfile, RawDateRange {}
export interface SystemProfile extends DataObject, CommonSystemProfile, DateRange {}

export type CostFunction = CostFunctions[keyof CostFunctions];
export type CostFunctions = {
  ratePlan: RatePlan;
  ghgRate: GHGRate;
  caisoRate: CAISORate;
  systemProfile: SystemProfile;
};
