import { MonthIndex } from '../common';


/** ============================ Types ===================================== */
export type Frame288DataType = 'average' | 'maximum' | 'minimum';
export type Frame288NumericType = Frame288Type<number>;
export type Frame288Type<T> = {
  [P in MonthIndex]: T[];
};

type PowerUnit = 'kW' | 'MW' | 'GW';
export type Frame288Options<UnitsType = string> = {
  name?: string;
  units?: UnitsType;
};

/** ============================ Wrappers ================================== */
export declare class Frame288Numeric {
  readonly flattened: number[];
  readonly frame: Frame288NumericType;
  units?: string;
  name?: string;
  
  constructor (frame: Frame288NumericType, options?: Frame288Options);
  divide (n: number, options?: Frame288Options): Frame288Numeric;
  getRange (): [number, number];
  getMax (): number;
  getMin (): number;
  getMonth (month: MonthIndex): Frame288NumericType[MonthIndex];
  getValueByDate (datetime: Date): number;
  getValueByMonthHour (month: MonthIndex, hour: number): number;
  map (fn: (n: number) => number, options?: Frame288Options): Frame288Numeric;
  multiply (n: number, options?: Frame288Options): Frame288Numeric;
  rename (name: string): Frame288Numeric;
  flatten (): number[];
}

export declare class PowerFrame288 extends Frame288Numeric {
  units: PowerUnit;
  
  constructor (frame: Frame288NumericType, options?: Frame288Options<PowerUnit>);
  scale (): PowerFrame288;
}
