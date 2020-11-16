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
  RawOriginFile,
  RawScenario,
  CAISORate,
  GHGRate,
  Meter,
  OriginFile,
  Scenario,
  ObjectWithId,
} from 'navigader/types';

/** ============================ Models slice ============================== */
// The `Exterior` vs. `Interior` dichotomy distinguishes between model objects internal to the
// store (i.e. those returned from selectors) and those external to the store (i.e. those provided
// to the action creators).
export type ModelClassInterior =
  | RawCAISORate
  | DERConfiguration
  | DERStrategy
  | RatePlan
  | RawGHGRate
  | RawMeter
  | RawOriginFile
  | RawScenario;

export type ModelClassExterior =
  | CAISORate
  | DERConfiguration
  | DERStrategy
  | GHGRate
  | Meter
  | OriginFile
  | RatePlan
  | Scenario;

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

/** ============================ UI slice ================================== */
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

export type DataSelector<T extends ObjectWithId> = (state: RootState) => T[];

// Updates the default state type used by `react-redux` so we don't need to manually specify the
// state type in every `useSelector` call
declare module 'react-redux' {
  interface DefaultRootState extends RootState {}
}
