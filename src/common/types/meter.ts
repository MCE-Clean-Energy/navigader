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
  meter_groups: AbstractMeterGroup['id'][];
  object_type: 'CustomerMeter' | 'ReferenceMeter';
};

export type RawMeter = MeterCommon & RawDataObject<'kw'>;
export type Meter = MeterCommon & DataObject;

/** ============================ Meter Group Types ========================= */
export type AbstractRawMeterGroup =
  & MeterAggregateMetrics
  & RawDataObject<'kw'>
  & {
    created_at: string;
    date_range: Tuple<string>;
    id: string;
    meter_count: number;
    name: string;
  }

  // Fields that can be requested but which are not included by default
  & Partial<{ meters: string[] }>;

export type AbstractMeterGroup =
  & Omit<AbstractRawMeterGroup, 'data' | 'date_range'>
  & DataObject
  & { date_range: Nullable<Tuple<Date>> };

/** ============================ Origin File Types ========================= */
type OriginFileFields =
  & NavigaderObject<'OriginFile'>
  & {
    metadata: {
      expected_meter_count: Nullable<number>;
      filename: string;
    }
  };

export type RawOriginFile = AbstractRawMeterGroup & OriginFileFields;
export type OriginFile = AbstractMeterGroup & OriginFileFields & ProgressFields;
