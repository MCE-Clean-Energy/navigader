import {
  BatteryConfiguration, BatteryStrategy, Nullable, RawCAISORate, RawGHGRate, RawMeter, RawScenario
} from 'navigader/types';


/** ============================ Slices ==================================== */
export type ModelsSlice = {
  caisoRates: RawCAISORate[];
  derConfigurations: BatteryConfiguration[];
  derStrategies: BatteryStrategy[];
  ghgRates: RawGHGRate[]
  hasMeterGroups: Nullable<boolean>;
  meters: RawMeter[];
  scenarios: RawScenario[];
};

export type UiSlice = {
  snackbar: {
    msg?: string;
    open: boolean;
    type?: 'success' | 'error';
  }
};

/** ============================ Root state ================================ */
export type RootState = {
  models: ModelsSlice
  ui: UiSlice;
};
