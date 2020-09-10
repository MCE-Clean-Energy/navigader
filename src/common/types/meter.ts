import { NavigaderObject, Nullable, ProgressFields } from './common';
import { DataObject, RawDataObject } from './data';


/** ============================ Meter Types =============================== */
type MeterCommon = {
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
type MeterGroupCommon = DataObject & ProgressFields;
type RawMeterGroupCommon = RawDataObject<'kw'> & {
  meter_count: number;
  meters: string[];
  name: string;
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
  & Omit<RawOriginFileMeterGroup, 'data'>
  & MeterGroupCommon;

export type CustomerClusterMeterGroup =
  & Omit<RawCustomerClusterMeterGroup, 'data'>
  & MeterGroupCommon;

export type RawMeterGroup = RawOriginFileMeterGroup | RawCustomerClusterMeterGroup;
export type MeterGroup = OriginFileMeterGroup | CustomerClusterMeterGroup;
