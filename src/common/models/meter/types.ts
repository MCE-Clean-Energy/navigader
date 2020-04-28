import { NavigaderObject, ProgressFields } from '@nav/common/models';
import { MonthIndex, Nullable } from '@nav/common/types';

/** ============================ Meter Types =============================== */
export type Frame288LoadType = 'total' | 'average' | 'maximum' | 'minimum' | 'count';
export type Frame288Type<T> = {
  [P in MonthIndex]: T[];
}
export type Frame288NumericType = Frame288Type<number>;

export type LoadType = 'default' | Frame288LoadType;
export type LoadTypeMap = {
  default: {
    index: string[];
    kw: number[];
  };
} & {
  [K in Frame288LoadType]: Frame288NumericType;
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
type MeterGroupCommon = {
  data: MeterDataField;
  meter_count: number;
  meters: string[];
  name: string;
};

export type RawOriginFileMeterGroup =
  NavigaderObject<'OriginFile'> &
  MeterGroupCommon & {
    metadata: {
      expected_meter_count: Nullable<number>;
      filename: string;
    };
  };

export type RawCustomerClusterMeterGroup =
  NavigaderObject<'CustomerCluster'> &
  MeterGroupCommon;

export type OriginFileMeterGroup = RawOriginFileMeterGroup & ProgressFields;
export type CustomerClusterMeterGroup = RawCustomerClusterMeterGroup & ProgressFields;

export type RawMeterGroup = RawOriginFileMeterGroup | RawCustomerClusterMeterGroup;
export type MeterGroup = OriginFileMeterGroup | CustomerClusterMeterGroup;
