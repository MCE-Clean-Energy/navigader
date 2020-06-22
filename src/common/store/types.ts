import {
  BatteryConfiguration, BatterySimulation, BatteryStrategy, Meter, Nullable, Scenario,
  StoredGHGRate
} from 'navigader/types';


/** ============================ Slices ==================================== */
export type ModelsSlice = {
  derConfigurations: BatteryConfiguration[];
  derSimulations: BatterySimulation[];
  derStrategies: BatteryStrategy[];
  ghgRates: StoredGHGRate[]
  hasMeterGroups: Nullable<boolean>;
  meters: Meter[];
  scenarios: Scenario[];
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
