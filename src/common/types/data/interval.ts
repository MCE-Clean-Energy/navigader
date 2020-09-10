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
  get domain (): { timestamp: DateTuple; value: NumberTuple; };
  get period (): number;
  get timeDomain (): DateTuple;
  get valueDomain (): NumberTuple;
  get values (): number[];
  get years (): number[];

  // Accessors
  startOfMonth (month: MonthIndex): Date | undefined;

  // Mutators
  rename (name: string): IntervalData;

  // Iteration methods
  filter (filters?: IntervalDataFilters): IntervalData;
  map (fn: (datum: IntervalDatum) => number, name?: string): IntervalData;

  // Transformations
  divide (n: number): IntervalData;
  multiply (multiplier: number | IntervalData, name?: string): IntervalData;
  subtract (other: IntervalData): IntervalData;

  // 288 methods
  align288 (frame: Frame288Numeric): IntervalData;
  map288 (frame: Frame288Numeric, fn: (datum: IntervalDatum, n: number) => number, name?: string): IntervalData;
  multiply288 (frame: Frame288Numeric, name?: string): IntervalData;
}
