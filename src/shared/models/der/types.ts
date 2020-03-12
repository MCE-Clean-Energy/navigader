import { Frame288 } from '@nav/shared/models/meter';
import { NavigaderObject } from '@nav/shared/types';


export type DerType = 'Battery' | 'Solar Panel';

/** ============================ Battery =================================== */
export type BatteryConfiguration = NavigaderObject<'BatteryConfiguration', {
  rating: number
  discharge_duration_hours: number;
  efficiency: number;
}>;

export type BatteryStrategy = NavigaderObject<'BatteryStrategy', {
  charge_schedule_frame: Frame288;
  discharge_schedule_frame: Frame288;
}>;
