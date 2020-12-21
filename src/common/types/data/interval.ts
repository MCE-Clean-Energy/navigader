import { Frame288Numeric } from './frame288';
import { DateTuple, Maybe, MonthIndex, Nullable, NumberTuple, Tuple } from '../common';

/** ============================ Types ===================================== */
export type RawDateRange = { date_range: Tuple<string> };
export type DateRange = { date_range: Nullable<Tuple<Date>> };
export type BasicIntervalDatum = { timestring: string; value: number };
export type BasicIntervalData = BasicIntervalDatum[];
export type ChartDatum = { name: string; timestamp: Date; value: number };
export type ChartData = ChartDatum[];

export type IntervalDataArray = IntervalDatum[];
export interface IntervalDatum extends BasicIntervalDatum {
  clone(value?: number): IntervalDatum;
  timestamp: Date;
}

export type RawIntervalData<Unit extends string, Column extends string = 'index'> = {
  [column in Column]: string[];
} &
  { [unit in Unit]: number[] };

export type IntervalDataFilters = Partial<{
  month: MonthIndex;
  start: Date;
  end: Date;
  range: DateTuple;
}>;

/** ============================ Wrapper =================================== */
export declare class IntervalData {
  readonly data: IntervalDataArray;
  name: string;

  // Setup and teardown
  constructor(data: BasicIntervalData, name: string);
  serialize<U extends string, C extends string>(unit: U, column: C): RawIntervalData<U, C>;

  // Getters
  get chartData(): ChartData;
  get domain(): { timestamp: DateTuple; value: NumberTuple };
  get period(): number;
  get timeDomain(): DateTuple;
  get valueDomain(): NumberTuple;
  get average(): number;
  get values(): number[];
  get years(): number[];

  // Accessors
  startOfMonth(month: MonthIndex): Maybe<Date>;

  // Mutators
  rename(name: string): IntervalData;

  // Iteration methods
  filter(filters?: IntervalDataFilters): IntervalData;
  map(fn: (datum: IntervalDatum) => number): IntervalData;

  // Transformations
  divide(n: number): IntervalData;
  multiply(multiplier: number | IntervalData): IntervalData;
  subtract(other: IntervalData): IntervalData;

  // 288 methods
  align288(frame: Frame288Numeric): IntervalData;
  map288(frame: Frame288Numeric, fn: (datum: IntervalDatum, n: number) => number): IntervalData;
  multiply288(frame: Frame288Numeric): IntervalData;
}
