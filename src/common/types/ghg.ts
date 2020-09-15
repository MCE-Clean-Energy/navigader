import { NavigaderObject } from './common';
import { Frame288Numeric, Frame288NumericType } from './data';


export type RawGHGRate = {
  data?: Frame288NumericType;
  effective: string;
  id: number;
  name: string;
  object_type: 'GHGRate';
  rate_unit: number;
  source: string;
};

export type GHGRate =
  & Omit<NavigaderObject<'GHGRate'>, 'created_at'>
  & Omit<RawGHGRate, 'id' | 'data'>
  & { data?: Frame288Numeric };
