import {
  AlertType, DERStrategy, DERConfiguration, Nullable, RawCAISORate, RawGHGRate, RawMeter,
  RawMeterGroup, RawScenario
} from 'navigader/types';


/** ============================ Slices ==================================== */
export type ModelsSlice = {
  caisoRates: RawCAISORate[];
  derConfigurations: DERConfiguration[];
  derStrategies: DERStrategy[];
  ghgRates: RawGHGRate[]
  hasMeterGroups: Nullable<boolean>;
  meterGroups: RawMeterGroup[];
  meters: RawMeter[];
  scenarios: RawScenario[];
};

export type UiSlice = {
  snackbar: {
    duration?: number;
    msg?: string;
    open: boolean;
    type?: AlertType;
  }
};

/** ============================ Root state ================================ */
export type RootState = {
  models: ModelsSlice
  ui: UiSlice;
};
