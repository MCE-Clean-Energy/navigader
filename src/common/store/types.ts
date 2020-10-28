import {
  AlertType,
  DERStrategy,
  DERConfiguration,
  Nullable,
  RatePlan,
  RawCAISORate,
  RawGHGRate,
  RawMeter,
  RawMeterGroup,
} from 'navigader/types';

/** ============================ Slices ==================================== */
export type ModelsSlice = {
  caisoRates: RawCAISORate[];
  derConfigurations: DERConfiguration[];
  derStrategies: DERStrategy[];
  ghgRates: RawGHGRate[];
  hasMeterGroups: Nullable<boolean>;
  meterGroups: RawMeterGroup[];
  meters: RawMeter[];
  ratePlans: RatePlan[];
};

export type UiSlice = {
  snackbar: {
    duration?: number;
    msg?: string;
    open: boolean;
    type?: AlertType;
  };
};

/** ============================ Root state ================================ */
export type RootState = {
  models: ModelsSlice;
  ui: UiSlice;
};

// Updates the default state type used by `react-redux` so we don't need to manually specify the
// state type in every `useSelector` call
declare module 'react-redux' {
  interface DefaultRootState extends RootState {}
}
