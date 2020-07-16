import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  BatteryConfiguration, BatteryStrategy, CAISORate, GHGRate, Meter, RawCAISORate, RawGHGRate,
  RawMeter, RawScenario, Scenario
} from 'navigader/types';
import { serializers } from 'navigader/util';
import _ from 'navigader/util/lodash';
import { RootState, ModelsSlice } from '../types';


/** ============================ Types ===================================== */
// The `Exterior` vs. `Interior` dichotomy distinguishes between model objects internal to the
// store (i.e. those returned from selectors) and those external to the store (i.e. those provided
// to the action creators).
type ModelClassInterior =
  | RawCAISORate
  | BatteryConfiguration
  | BatteryStrategy
  | RawGHGRate
  | RawMeter
  | RawScenario;

type ModelClassExterior =
  | CAISORate
  | BatteryConfiguration
  | BatteryStrategy
  | GHGRate
  | Meter
  | Scenario;

/** ============================ Actions =================================== */
/** Payloads */
type RemoveModelAction = PayloadAction<ModelClassExterior>;
type UpdateHasMeterGroupsAction = PayloadAction<boolean>;

/** Prepared Payloads */
type UpdateModelAction = PayloadAction<ModelClassInterior>;
type UpdateModelsAction = PayloadAction<ModelClassInterior[]>;

/** ============================ Slice ===================================== */
const initialState = {
  caisoRates: [],
  derConfigurations: [],
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
export const selectCAISORates = (state: RootState) => state.models.caisoRates.map(serializers.parseCAISORate);
export const selectDERConfigurations = (state: RootState) => state.models.derConfigurations;
export const selectDERStrategies = (state: RootState) => state.models.derStrategies;
export const selectGHGRates = (state: RootState) => state.models.ghgRates.map(serializers.parseGHGRate);
export const selectMeters = (state: RootState) => state.models.meters.map(serializers.parseMeter);
export const selectScenarios = (state: RootState) => state.models.scenarios.map(serializers.parseScenario);
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
    case 'CAISORate':
      return state.caisoRates;
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
 * Converts a `ModelClassExterior` object to a `ModelClassInterior` object
 *
 * @param {ModelClassExterior} model: the model to prepare
 */
function prepareModel (model: ModelClassExterior): ModelClassInterior {
  switch (model.object_type) {
    case 'BatteryStrategy':
    case 'BatteryConfiguration':
      return model;
    case 'CAISORate':
      return serializers.serializeCAISORate(model);
    case 'CustomerMeter':
    case 'ReferenceMeter':
      return serializers.serializeMeter(model);
    case 'GHGRate':
      return serializers.serializeGHGRate(model);
    case 'SingleScenarioStudy':
      return serializers.serializeScenario(model);
  }
}
