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
type MeterGroupCommon = DataObject & ProgressFields & {
  time_period: Nullable<Tuple<Date>>;
};

type RawMeterGroupCommon = MeterAggregateMetrics & RawDataObject<'kw'> & {
  meter_count: number;
  meters: string[];
  name: string;
  time_period: Tuple<string>;
};

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
  & Omit<RawOriginFileMeterGroup, 'data' | 'time_period'>
  & MeterGroupCommon;

export type CustomerClusterMeterGroup =
  & Omit<RawCustomerClusterMeterGroup, 'data' | 'time_period'>
  & MeterGroupCommon;

export type RawMeterGroup = RawOriginFileMeterGroup | RawCustomerClusterMeterGroup;
export type MeterGroup = OriginFileMeterGroup | CustomerClusterMeterGroup;
