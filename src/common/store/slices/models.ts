import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import findIndex from 'lodash/findIndex';
import merge from 'lodash/merge';

import { BatteryConfiguration, BatteryStrategy, BatterySimulation } from '@nav/common/models/der';
import { Meter } from '@nav/common/models/meter';
import { Scenario } from '@nav/common/models/scenario';
import { RootState, ModelsSlice } from '../types';


/** ============================ Actions =================================== */
type ModelName = keyof ModelsSlice;
type ModelClass =
  | BatteryConfiguration
  | BatterySimulation
  | BatteryStrategy
  | Meter
  | Scenario;

/** Updates models en-masse */
type SetModelsAction = PayloadAction<ModelClass[]>;

/** Updates a single model using its `id` field */
type UpdateModelAction = PayloadAction<ModelClass>;

/** ============================ Slice ===================================== */
const initialState = {
  derConfigurations: [],
  derSimulations: [],
  derStrategies: [],
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
    updateModels: (state, action: SetModelsAction) => {
      action.payload.forEach(model => addOrUpdateModel(state, model));
    },
    updateModel: (state, action: UpdateModelAction) => {
      addOrUpdateModel(state, action.payload);
    }
  }
});

/** ============================ Exports =================================== */
export const { reducer } = slice;
export const { updateModels, updateModel } = slice.actions;

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

/** ======================= */
/**
 * Updates a model in state if it is already present, or adds it to state if it is not. The model's
 * `id` and `object_type` are used to access the model within the slice
 *
 * @param {ModelsSlice} state: the current state of the `models` slice
 * @param {ModelClass} model: the model to add or update to the store
 */
function addOrUpdateModel (state: ModelsSlice, model: ModelClass) {
  // Get the model's slice
  let slice: Array<ModelClass>;
  switch (model.object_type) {
    case 'BatteryConfiguration':
      slice = state.derConfigurations;
      break;
    case 'BatteryStrategy':
      slice = state.derStrategies;
      break;
    case 'StoredBatterySimulation':
      slice = state.derSimulations;
      break;
    case 'CustomerMeter':
    case 'ReferenceMeter':
      slice = state.meters;
      break;
    case 'SingleScenarioStudy':
      slice = state.scenarios;
      break;
  }
  
  // Get the model
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
