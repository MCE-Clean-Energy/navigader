import { MonthIndex, NavigaderObject } from '@nav/shared/types';

/** ============================ Meter Types =============================== */
export type Frame288LoadType = 'total' | 'average' | 'maximum' | 'minimum' | 'count';
export type Frame288<T> = {
  [P in MonthIndex]: T[];
}
export type Frame288Numeric = Frame288<number>;

export type LoadType = 'default' | Frame288LoadType;
export type LoadTypeMap = {
  default: {
    index: string[];
    kw: number[];
  };
} & {
  [K in Frame288LoadType]: Frame288Numeric;
};

export type MeterDataField = Partial<LoadTypeMap>
export type Meter = {
  data: MeterDataField;
  id: string;
  metadata: {
    sa_id: number;
    rate_plan_name: string;
    state: string;
  };
  meter_groups: MeterGroup['id'][];
  object_type: 'CustomerMeter' | 'ReferenceMeter';
};

/** ============================ Meter Group Types ========================= */
// Raw meter groups
type RawMeterGroupCommon = {
  data: MeterDataField;
  meter_count: number;
  meters: string[];
};

export type RawOriginFileMeterGroup = NavigaderObject<'OriginFile'> & RawMeterGroupCommon & {
  metadata: {
    expected_meter_count: number | null;
    filename: string;
    owners: any[];
  };
};

export type RawCustomerClusterMeterGroup =
  NavigaderObject<'CustomerCluster'> &
  RawMeterGroupCommon &
  { metadata: {}; };

// Parsed meter groups
type MeterGroupCommon = {
  data: MeterDataField;
  numMeters: number;
  meterIds: string[]
};

export type OriginFileMeterGroup =
  NavigaderObject<'OriginFile'> &
  MeterGroupCommon &
  {
    fileName: string;
    numMetersExpected: number | null;
  };

export type CustomerClusterMeterGroup = NavigaderObject<'CustomerCluster'> & MeterGroupCommon;

export type RawMeterGroup = RawOriginFileMeterGroup | RawCustomerClusterMeterGroup;
export type MeterGroup = OriginFileMeterGroup | CustomerClusterMeterGroup;
