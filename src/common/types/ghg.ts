import { NavigaderObject } from './common';
import { Frame288Numeric, Frame288NumericType } from './frame288';


export type RawGHGRate = {
  data?: Frame288NumericType;
  effective: string;
  id: number;
  name: string;
  rate_unit: number;
  source: string;
};

export type GHGRate = NavigaderObject<'GHGRate'> & Omit<RawGHGRate, 'id' | 'data'> & {
  data?: Frame288Numeric
};

// The `GHGRate` isn't serializable with a `Frame288Numeric` member. This type is what will be
// stored instead
export type StoredGHGRate = Omit<GHGRate, 'data'> & Pick<RawGHGRate, 'data'>;
