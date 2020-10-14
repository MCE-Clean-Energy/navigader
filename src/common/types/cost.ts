import { DeferrableFields } from './api';
import { IdType, NavigaderObject, Nullable, StateChoice } from './common';
import { DataObject, Frame288Numeric, Frame288NumericType, RawDataObject } from './data';


/** ============================ CAISO Rates =============================== */
type CAISORateFilters = Partial<{
  DATA_ITEM: 'LMP_PRC'
}>;

type CAISORateCommon = {
  filters: CAISORateFilters;
  id: IdType;
  name: string;
  year: number;

  object_type: 'CAISORate';
};

export type RawCAISORate = CAISORateCommon & RawDataObject<'$/kwh', 'start'>;
export type CAISORate = CAISORateCommon & DataObject;

/** ============================ Rate Plans ================================ */
export type LoadServingEntity = {
  id: number;
  name: string;
  object_type: 'LoadServingEntity';
  short_name: string;
  state: StateChoice;
};

export type RateComponent = {
  rate: number;
  unit: string;
} & Partial<{
  max: number;
  adj: number;
  sell: number;
}>

export type RateBucket = Partial<{
  energyRateTiers: RateComponent[];
  demandRateTiers: RateComponent[];
}>

export type EnergyKeyVal = {
  key: string;
  val: number;
}

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
}>

export type RateCollection = {
  effective_date: string;
  id: number;
  object_type: 'RateCollection';
  openei_url: Nullable<string>;
  rate_plan: RatePlan['id'];
  utility_url: string;
  rate_data: RateData;
};

export type RatePlan = DeferrableFields<{
  demand_max: Nullable<number>;
  demand_min: Nullable<number>;
  description: Nullable<string>;
  id: number;
  load_serving_entity: LoadServingEntity;
  object_type: 'RatePlan';
  name: string;
}, {
  sector: string;
  rate_collections: RateCollection[];
  start_date: string;
}>;

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

export type GHGRate =
  & Omit<NavigaderObject<'GHGRate'>, 'created_at'>
  & Omit<RawGHGRate, 'id' | 'data'>
  & { data?: Frame288Numeric };
