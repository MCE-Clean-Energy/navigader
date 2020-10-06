import { DeferrableFields } from './api';
import { NavigaderObject, Nullable, ProgressFields, Tuple } from './common';
import { DataObject, RawDataObject } from './data';


/** ============================ Meter Types =============================== */
type MeterAggregateMetrics = {
  max_monthly_demand?: number;
  total_kwh?: number;
};

type MeterCommon = MeterAggregateMetrics & {
  id: string;
  metadata: {
    sa_id: number;
    rate_plan_name: string;
    state: string;
  };
  meter_groups: MeterGroup['id'][];
  object_type: 'CustomerMeter' | 'ReferenceMeter';
};

export type RawMeter = MeterCommon & RawDataObject<'kw'>;
export type Meter = MeterCommon & DataObject;

/** ============================ Meter Group Types ========================= */
type MeterGroupCommon = DataObject & ProgressFields & { date_range: Nullable<Tuple<Date>> };
type RawMeterGroupCommon = DeferrableFields<
  & MeterAggregateMetrics
  & RawDataObject<'kw'>
  & {
    meter_count: number;
    name: string;
    date_range: Tuple<string>;
  },

  // Fields that can be requested but which are not included by default
  {
    meters: string[];
  }
>;

export type RawOriginFileMeterGroup =
  & NavigaderObject<'OriginFile'>
  & RawMeterGroupCommon
  & {
    metadata: {
      expected_meter_count: Nullable<number>;
      filename: string;
    };
  };

export type RawCustomerClusterMeterGroup =
  & NavigaderObject<'CustomerCluster'>
  & RawMeterGroupCommon;

export type OriginFileMeterGroup =
  & Omit<RawOriginFileMeterGroup, 'data' | 'date_range'>
  & MeterGroupCommon;

export type CustomerClusterMeterGroup =
  & Omit<RawCustomerClusterMeterGroup, 'data' | 'date_range'>
  & MeterGroupCommon;

export type RawMeterGroup = RawOriginFileMeterGroup | RawCustomerClusterMeterGroup;
export type MeterGroup = OriginFileMeterGroup | CustomerClusterMeterGroup;
