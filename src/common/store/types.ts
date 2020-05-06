import { BatteryConfiguration, BatteryStrategy, BatterySimulation } from 'navigader/models/der';
import { Meter } from 'navigader/models/meter';
import { Scenario } from 'navigader/models/scenario';
import { Nullable } from 'navigader/types';


/** ============================ Slices ==================================== */
export type ModelsSlice = {
  derConfigurations: BatteryConfiguration[];
  derSimulations: BatterySimulation[];
  derStrategies: BatteryStrategy[];
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
