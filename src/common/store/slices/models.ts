import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  BatteryConfiguration, BatterySimulation, BatteryStrategy, Frame288Numeric, GHGRate, Meter,
  Scenario, StoredGHGRate
} from 'navigader/types';
import _ from 'navigader/util/lodash';
import { RootState, ModelsSlice } from '../types';


/** ============================ Actions =================================== */
type ModelName = keyof Omit<ModelsSlice, 'hasMeterGroups'>;

// The `Exterior` vs. `Interior` dichotomy distinguishes between model objects internal to the
// store (i.e. those returned from selectors) and those external to the store (i.e. those provided
// to the action creators).
type ModelClassExterior = Exclude<ModelClassInterior, StoredGHGRate> | GHGRate;
type ModelClassInterior =
  | BatteryConfiguration
  | BatterySimulation
  | BatteryStrategy
  | StoredGHGRate
  | Meter
  | Scenario;

/** Payloads */
type RemoveModelAction = PayloadAction<ModelClassExterior>;
type UpdateHasMeterGroupsAction = PayloadAction<boolean>;

/** Prepared Payloads */
type UpdateModelAction = PayloadAction<ModelClassInterior>;
type UpdateModelsAction = PayloadAction<ModelClassInterior[]>;

/** ============================ Slice ===================================== */
const initialState = {
  derConfigurations: [],
  derSimulations: [],
  derStrategies: [],
  ghgRates: [],
  hasMeterGroups: null,
  meters: [],
  scenarios: []
} as ModelsSlice;

/**
 * Global UI slice. This will hold state for certain global UI state parameters, such as whether a
 * snackbar message or modal is open
 */
const slice = createSlice({
  name: 'models',
  initialState,
  reducers: {
    removeModel: (state, action: RemoveModelAction) => {
      const model = action.payload;
      const slice = getSliceForModel(state, model);
      
      // If we find the model in the slice, splice it out
      const modelIndex = _.findIndex(slice, { id: model.id });
      if (modelIndex !== -1) {
        slice.splice(modelIndex, 1);
      }
    },
    updateHasMeterGroups: (state, action: UpdateHasMeterGroupsAction) => {
      state.hasMeterGroups = action.payload
    },
    updateModels: {
      prepare: (models: ModelClassExterior[]) => ({ payload: models.map(prepareModel) }),
      reducer: (state, action: UpdateModelsAction) => {
        action.payload.forEach(model => addOrUpdateModel(state, model));
      }
    },
    updateModel: {
      prepare: (model: ModelClassExterior) => ({ payload: prepareModel(model) }),
      reducer:(state, action: UpdateModelAction) => {
        addOrUpdateModel(state, action.payload);
      }
    }
  }
});

export const { reducer } = slice;
export const { removeModel, updateHasMeterGroups, updateModels, updateModel } = slice.actions;

/** ============================ Selectors ================================= */
/**
 * A "selector creator" that accepts a type of model and returns a selector that will return the
 * models of that type
 *
 * @param {ModelName} modelType: the type of model to retrieve from the store
 */
export function selectModels <Type extends ModelName>(modelType: Type) {
  return function (state: RootState): ModelsSlice[Type] {
    return state.models[modelType];
  };
}

/**
 * Special selector that retrieves `StoredGHGRate` objects and runs them through an "extraction
 * function" to instantiate the object's numeric `Frame288` class
 *
 * @param {RootState} state: the current state of the store. Typically provided by redux.
 */
export function selectGhgRates (state: RootState) {
  return state.models.ghgRates.map(extractGhgRate);
}

/**
 * Selects the `hasMeterGroups` state pocket
 */
export const selectHasMeterGroups = (state: RootState) => state.models.hasMeterGroups;

/** ============================ Reducer methods =========================== */
/**
 * Updates a model in state if it is already present, or adds it to state if it is not. The model's
 * `id` and `object_type` are used to access the model within the slice
 *
 * @param {ModelsSlice} state: the current state of the `models` slice
 * @param {ModelClassInterior} model: the model to add or update to the store
 */
function addOrUpdateModel (state: ModelsSlice, model: ModelClassInterior) {
  const slice = getSliceForModel(state, model);
  const modelIndex = _.findIndex(slice, { id: model.id });
  
  if (modelIndex === -1) {
    // Add it to the store
    slice.push(model);
    return;
  }
  
  // Splice it into the slice
  const merged = _.merge({}, slice[modelIndex], model);
  slice.splice(modelIndex, 1, merged);
}

/** ============================ Helpers =================================== */
function getSliceForModel (
  state: ModelsSlice,
  model: Pick<ModelClassExterior, 'object_type'>
): Array<ModelClassInterior> {
  switch (model.object_type) {
    case 'BatteryConfiguration':
      return state.derConfigurations;
    case 'BatteryStrategy':
      return state.derStrategies;
    case 'StoredBatterySimulation':
      return state.derSimulations;
    case 'CustomerMeter':
    case 'ReferenceMeter':
      return state.meters;
    case 'SingleScenarioStudy':
      return state.scenarios;
    case 'GHGRate':
      return state.ghgRates;
  }
}

/**
 * Converts a `GHGRate` to a `StoredGHGRate` by serializing the frame 288 data
 *
 * @param {GHGRate} ghgRate: the `GHGRate` object that is entering the store
 */
function storeGhgRate (ghgRate: GHGRate): StoredGHGRate {
  return {
    ...ghgRate,
    data: ghgRate.data?.frame
  };
}

/**
 * Converts a `StoredGHGRate` to a `GHGRate` by de-serializing the frame 288 data
 *
 * @param {StoredGHGRate} storedRate: the `StoredGHGRate` object that is leaving the store
 */
function extractGhgRate (storedRate: StoredGHGRate): GHGRate {
  return {
    ...storedRate,
    data: storedRate.data ? new Frame288Numeric(storedRate.data, { name: storedRate.name }) : undefined,
  }
}

/**
 * Converts a `ModelClassExterior` object to a `ModelClassInterior` object
 *
 * @param {ModelClassExterior} model: the model to prepare
 */
function prepareModel (model: ModelClassExterior): ModelClassInterior {
  return model.object_type === 'GHGRate'
    ? storeGhgRate(model)
    : model;
}
