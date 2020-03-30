import { Frame288 } from '@nav/shared/models/meter';
import { DeferrableFields2, RawNavigaderObject } from '@nav/shared/types';


export type DerType = 'Battery' | 'Solar Panel';

/** ============================ Battery =================================== */
type DerConfigurationDeferrableFields = {
  data: {
    rating: number
    discharge_duration_hours: number;
    efficiency: number;
  };
};

export type BatteryConfiguration<K extends keyof DerConfigurationDeferrableFields = never> =
  DeferrableFields2<
    RawNavigaderObject<'BatteryConfiguration'> & { der_type: 'Battery'; },
    DerConfigurationDeferrableFields,
    K
  >;

type Frame288BatteryStrategy = Frame288<number | 'inf' | '-inf'>;
type DerStrategyDeferredFields = {
  data: {
    charge_schedule_frame: Frame288BatteryStrategy;
    discharge_schedule_frame: Frame288BatteryStrategy;
  };
};

export type BatteryStrategy<K extends keyof DerStrategyDeferredFields = never> =
  DeferrableFields2<
    RawNavigaderObject<'BatteryStrategy'> & { der_type: 'Battery'; },
    DerStrategyDeferredFields,
    K
  >;
