import { Frame288DataType, Frame288NumericType } from './frame288';
import { IntervalDataWrapper, RawIntervalData } from './interval';

export * from './frame288';
export * from './interval';

/** ============================ Data fields =============================== */
type Frame288DataTypeMap = { [K in Frame288DataType]: Frame288NumericType; };
export type DataTypeMap = Partial<{ default: IntervalDataWrapper; } & Frame288DataTypeMap>;
export type RawDataTypeMap<Unit extends string, Column extends string = 'index'> =
  Partial<{ default: RawIntervalData<Unit, Column>; } & Frame288DataTypeMap>;
