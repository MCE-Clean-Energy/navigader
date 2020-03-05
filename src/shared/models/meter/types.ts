import { MonthIndex } from '@nav/shared/types';

/** ============================ Meter Types =============================== */
export type Frame288LoadType = 'total' | 'average' | 'maximum' | 'minimum' | 'count';
export type Frame288 = {
  [P in MonthIndex]: number[];
}

export type ComputedValueTypes = {
  maxKw: number;
};

type ComputedValues = {
  computedValues: Partial<ComputedValueTypes>
};

export type LoadType = 'default' | Frame288LoadType;
export type LoadTypeMap = {
  default: {
    index: string[];
    kw: number[];
  };
} & {
  [K in Frame288LoadType]: Frame288;
};

type MeterType = 'CustomerMeter' | 'ReferenceMeter';
export type MeterDataField = Partial<LoadTypeMap>
export type RawMeter = {
  data: MeterDataField;
  id: string;
  metadata: {
    sa_id: number;
    rate_plan_name: string;
    state: string;
  };
  meter_groups: MeterGroup['id'][];
  object_type: MeterType;
};

export type Meter = {
  data: MeterDataField & ComputedValues;
  id: string;
  metaData: {
    meterGroupIds: MeterGroup['id'][];
    ratePlan: string;
    saId: number;
    type: string;
  };
};

/** ============================ Meter Group Types ========================= */
// Raw meter groups
type RawMeterGroupCommon = {
  created_at: string;
  data: MeterDataField;
  id: string;
  meter_count: number;
  meters: string[];
  name: string | null;
};

export type RawOriginFileMeterGroup = RawMeterGroupCommon & {
  object_type: 'OriginFile';
  metadata: {
    expected_meter_count: number | null;
    filename: string;
    owners: any[];
  };
};

export type RawCustomerClusterMeterGroup = RawMeterGroupCommon & {
  object_type: 'CustomerCluster';
  metadata: {};
};

// Parsed meter groups
type MeterGroupCommon = {
  created: string;
  data: MeterDataField;
  id: string;
  name: string | null;
  numMeters: number;
  meterIds: string[]
};

export type OriginFileMeterGroup = MeterGroupCommon & {
  groupType: RawOriginFileMeterGroup['object_type'];
  fileName: string;
  numMetersExpected: number | null;
}

export type CustomerClusterMeterGroup = MeterGroupCommon & {
  groupType: RawCustomerClusterMeterGroup['object_type'];
};

export type RawMeterGroup = RawOriginFileMeterGroup | RawCustomerClusterMeterGroup;
export type MeterGroup = OriginFileMeterGroup | CustomerClusterMeterGroup;
