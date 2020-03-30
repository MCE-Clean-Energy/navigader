import { BatteryConfiguration, BatteryStrategy } from '@nav/shared/models/der';


/** ============================ Slices ==================================== */
export type ModelsSlice = {
  derConfigurations: BatteryConfiguration[],
  derStrategies: BatteryStrategy[]
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
