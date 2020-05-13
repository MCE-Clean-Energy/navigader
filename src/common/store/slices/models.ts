import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import findIndex from 'lodash/findIndex';
import merge from 'lodash/merge';

import { BatteryConfiguration, BatteryStrategy, BatterySimulation } from 'navigader/models/der';
import { Meter } from 'navigader/models/meter';
import { Scenario } from 'navigader/models/scenario';
import { RootState, ModelsSlice } from '../types';


/** ============================ Actions =================================== */
type ModelName = keyof ModelsSlice;
type ModelClass =
  | BatteryConfiguration
  | BatterySimulation
  | BatteryStrategy
  | Meter
  | Scenario;

/** Payloads */
type RemoveModelAction = PayloadAction<ModelClass>;
type UpdateModelsAction = PayloadAction<ModelClass[]>;
type UpdateHasMeterGroupsAction = PayloadAction<boolean>;
type UpdateModelAction = PayloadAction<ModelClass>;

/** ============================ Slice ===================================== */
const initialState = {
  derConfigurations: [],
  derSimulations: [],
  derStrategies: [],
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
      const modelIndex = findIndex(slice, { id: model.id });
      if (modelIndex !== -1) {
        slice.splice(modelIndex, 1);
      }
    },
    updateHasMeterGroups: (state, action: UpdateHasMeterGroupsAction) => {
      state.hasMeterGroups = action.payload
    },
    updateModels: (state, action: UpdateModelsAction) => {
      action.payload.forEach(model => addOrUpdateModel(state, model));
    },
    updateModel: (state, action: UpdateModelAction) => {
      addOrUpdateModel(state, action.payload);
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
 * Selects the `hasMeterGroups` state pocket
 */
export const selectHasMeterGroups = (state: RootState) => state.models.hasMeterGroups;

/** ============================ Reducer methods =========================== */
/**
 * Updates a model in state if it is already present, or adds it to state if it is not. The model's
 * `id` and `object_type` are used to access the model within the slice
 *
 * @param {ModelsSlice} state: the current state of the `models` slice
 * @param {ModelClass} model: the model to add or update to the store
 */
function addOrUpdateModel (state: ModelsSlice, model: ModelClass) {
  const slice = getSliceForModel(state, model);
  const modelIndex = findIndex(slice, { id: model.id });
  if (modelIndex === -1) {
    // Add it to the store
    slice.push(model);
    return;
  }
  
  // Splice it into the slice
  const merged = merge({}, slice[modelIndex], model);
  slice.splice(modelIndex, 1, merged);
}

/** ============================ Helpers =================================== */
function getSliceForModel (state: ModelsSlice, model: ModelClass): Array<ModelClass> {
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
  }
}
