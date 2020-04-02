import { BatteryConfiguration, BatteryStrategy } from '@nav/shared/models/der';
import { Meter } from '@nav/shared/models/meter';
import { Scenario } from '@nav/shared/models/scenario';


/** ============================ Slices ==================================== */
export type ModelsSlice = {
  derConfigurations: BatteryConfiguration[];
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
