import _ from 'lodash';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  isOriginFile,
  isScenario,
  ModelsSlice,
  ModelClassExterior,
  ModelClassInterior,
  RootState,
  Scenario,
} from 'navigader/types';
import { serializers } from 'navigader/util';

/** ============================ Actions =================================== */
/** Payloads */
type UpdateHasMeterGroupsAction = PayloadAction<boolean>;

/** Prepared Payloads */
type ModelAction = PayloadAction<ModelClassInterior>;
type ModelsAction = PayloadAction<ModelClassInterior[]>;

/** ============================ Slice ===================================== */
const initialState: ModelsSlice = {
  caisoRates: [],
  derConfigurations: [],
  derStrategies: [],
  ghgRates: [],
  hasMeterGroups: null,
  meterGroups: [],
  meters: [],
  ratePlans: [],
  systemProfiles: [],
};

/**
 * Global UI slice. This will hold state for certain global UI state parameters, such as whether a
 * snackbar message or modal is open
 */
const slice = createSlice({
  name: 'models',
  initialState,
  reducers: {
    removeModel: {
      prepare: (model: ModelClassExterior) => ({ payload: prepareModel(model) }),
      reducer: (state, action: ModelAction) => {
        const model = action.payload;
        const slice = getSliceForModel(state, model);

        // If we find the model in the slice, splice it out
        const modelIndex = _.findIndex(slice, ['id', model.id]);
        if (modelIndex !== -1) {
          slice.splice(modelIndex, 1);
        }
      },
    },
    updateHasMeterGroups: (state, action: UpdateHasMeterGroupsAction) => {
      state.hasMeterGroups = action.payload;
    },
    updateModels: {
      prepare: (models: ModelClassExterior[]) => ({ payload: models.map(prepareModel) }),
      reducer: (state, action: ModelsAction) => {
        action.payload.forEach((model) => addOrUpdateModel(state, model));
      },
    },
    updateModel: {
      prepare: (model: ModelClassExterior) => ({ payload: prepareModel(model) }),
      reducer: (state, action: ModelAction) => {
        addOrUpdateModel(state, action.payload);
      },
    },
  },
});

export const { reducer } = slice;
export const { removeModel, updateHasMeterGroups, updateModels, updateModel } = slice.actions;

/** ============================ Selectors ================================= */
export const selectCAISORates = (state: RootState) =>
  state.models.caisoRates.map(serializers.parseCAISORate);
export const selectDERConfigurations = (state: RootState) => state.models.derConfigurations;
export const selectDERStrategies = (state: RootState) => state.models.derStrategies;
export const selectGHGRates = (state: RootState) =>
  state.models.ghgRates.map(serializers.parseGHGRate);
export const selectMeterGroups = (state: RootState) =>
  state.models.meterGroups.map(serializers.parseMeterGroup);
export const selectMeters = (state: RootState) => state.models.meters.map(serializers.parseMeter);
export const selectHasMeterGroups = (state: RootState) => state.models.hasMeterGroups;
export const selectRatePlans = (state: RootState) => state.models.ratePlans;

export const selectOriginFiles = (state: RootState) => {
  const originFiles = _.filter(state.models.meterGroups, isOriginFile);
  return originFiles.map(serializers.parseOriginFile);
};

export const selectScenario = (id: Scenario['id']) => (state: RootState) => {
  const scenarios = _.filter(state.models.meterGroups, isScenario);
  const scenario = _.find(scenarios, { id });
  return scenario ? serializers.parseScenario(scenario, state.models.meterGroups) : undefined;
};

export const selectScenarios = (state: RootState) => {
  const scenarios = _.filter(state.models.meterGroups, isScenario);
  return scenarios.map((scenario) => serializers.parseScenario(scenario, state.models.meterGroups));
};

export const selectSystemProfiles = (state: RootState) =>
  state.models.systemProfiles.map(serializers.parseSystemProfile);

/** ============================ Reducer methods =========================== */
/**
 * Updates a model in state if it is already present, or adds it to state if it is not. The model's
 * `id` and `object_type` are used to access the model within the slice
 *
 * @param {ModelsSlice} state: the current state of the `models` slice
 * @param {ModelClassInterior} model: the model to add or update to the store
 */
function addOrUpdateModel(state: ModelsSlice, model: ModelClassInterior) {
  const slice = getSliceForModel(state, model);
  const modelIndex = _.findIndex(slice, ['id', model.id]);

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
function getSliceForModel(
  state: ModelsSlice,
  model: Pick<ModelClassExterior, 'object_type'>
): Array<ModelClassInterior> {
  switch (model.object_type) {
    case 'BatteryConfiguration':
    case 'EVSEConfiguration':
    case 'SolarPVConfiguration':
      return state.derConfigurations;
    case 'BatteryStrategy':
    case 'EVSEStrategy':
    case 'SolarPVStrategy':
      return state.derStrategies;
    case 'CAISORate':
      return state.caisoRates;
    case 'OriginFile':
    case 'CustomerMeter':
    case 'ReferenceMeter':
      return state.meters;
    case 'GHGRate':
      return state.ghgRates;
    case 'Scenario':
      return state.meterGroups;
    case 'RatePlan':
      return state.ratePlans;
    case 'SystemProfile':
      return state.systemProfiles;
  }
}

/**
 * Converts a `ModelClassExterior` object to a `ModelClassInterior` object
 *
 * @param {ModelClassExterior} model: the model to prepare
 */
function prepareModel(model: ModelClassExterior): ModelClassInterior {
  switch (model.object_type) {
    case 'BatteryStrategy':
    case 'BatteryConfiguration':
    case 'EVSEConfiguration':
    case 'EVSEStrategy':
    case 'RatePlan':
    case 'SolarPVConfiguration':
    case 'SolarPVStrategy':
      return model;
    case 'SystemProfile':
      return serializers.serializeSystemProfile(model);
    case 'CAISORate':
      return serializers.serializeCAISORate(model);
    case 'OriginFile':
      return serializers.serializeOriginFile(model);
    case 'CustomerMeter':
    case 'ReferenceMeter':
      return serializers.serializeMeter(model);
    case 'GHGRate':
      return serializers.serializeGHGRate(model);
    case 'Scenario':
      return serializers.serializeScenario(model);
  }
}
