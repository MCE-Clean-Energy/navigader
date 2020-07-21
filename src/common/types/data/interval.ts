import { Frame288Numeric } from './frame288';
import { DateTuple, MonthIndex, NumberTuple } from '../common';


/** ============================ Types ===================================== */
export type IntervalDatum = { timestamp: Date; value: number };
export type IntervalDataArray = IntervalDatum[];
export type RawIntervalData<Unit extends string, Column extends string = 'index'> =
  & { [column in Column]: string[]; }
  & { [unit in Unit]: number[]; };

export type IntervalDataFilters = Partial<{
  month: MonthIndex,
  start: Date,
  end: Date,
  range: [Date, Date]
}>;

/** ============================ Wrapper =================================== */
export declare class IntervalData {
  readonly data: IntervalDataArray;
  name: string;

  // Setup and teardown
  constructor (data: IntervalDataArray, name: string);
  serialize <U extends string, C extends string>(unit: U, column: C): RawIntervalData<U, C>;

  // Getters
  domain (): { timestamp: DateTuple; value: NumberTuple; };
  get period (): number;
  startOfMonth (month: MonthIndex): Date | undefined;
  timeDomain (): DateTuple;
  valueDomain (): NumberTuple;
  values (): number[];
  get years (): number[];
  
  // Iteration methods
  map (fn: (datum: IntervalDatum) => number, name: string): IntervalData;
  filter (filters?: IntervalDataFilters): IntervalData;
  
  // Mathematical operations
  subtract (other: IntervalData): IntervalData;
  divide (n: number): IntervalData;
  multiply (multiplier: number | IntervalData, name?: string): IntervalData;
  
  // 288 methods
  map288 (frame: Frame288Numeric, fn: (datum: IntervalDatum, n: number) => number, name?: string): IntervalData;
  multiply288 (frame: Frame288Numeric, name?: string): IntervalData;
  align288 (frame: Frame288Numeric): IntervalData;
}
