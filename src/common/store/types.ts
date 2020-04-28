import { BatteryConfiguration, BatteryStrategy, BatterySimulation } from '@nav/common/models/der';
import { Meter } from '@nav/common/models/meter';
import { Scenario } from '@nav/common/models/scenario';


/** ============================ Slices ==================================== */
export type ModelsSlice = {
  derConfigurations: BatteryConfiguration[];
  derSimulations: BatterySimulation[];
  derStrategies: BatteryStrategy[];
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
