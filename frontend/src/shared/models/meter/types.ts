
/** ============================ Meter Types =============================== */
type Frame288Keys = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type Frame288LoadType = 'total' | 'average' | 'maximum' | 'minimum' | 'count';
export type Frame288 = {
  [P in Frame288Keys]: number[];
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

export type MeterDataField = Partial<LoadTypeMap>

type CustomerMeter = {
  meter_type: 'customermeter';
  customermeter: {
    sa_id: number;
    rate_plan_name: string;
    state: string;
  };
}

type ReferenceMeter = {
  meter_type: 'referencemeter';
  referencemeter: {
    sa_id: number;
    rate_plan_name: string;
    state: string;
  };
};

type RawMeterCommon = {
  data: MeterDataField;
  id: string;
  meter_groups: MeterGroup['id'][];
}

export type RawCustomerMeter = RawMeterCommon & CustomerMeter;
export type RawReferenceMeter = RawMeterCommon & ReferenceMeter;
export type RawMeter = RawCustomerMeter | RawReferenceMeter;

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
type MeterGroupType = 'originfile';
export type RawMeterGroup = {
  created_at: string;
  data: MeterDataField;
  id: string;
  meter_count: number;
  meter_group_type: MeterGroupType;
  meters: string[]
}

export type MeterGroup = {
  created: string;
  data: MeterDataField;
  groupType: MeterGroupType;
  id: string;
  numMeters: number;
  meterIds: string[]
};
