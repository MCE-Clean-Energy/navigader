import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import findIndex from 'lodash/findIndex';

import { BatteryConfiguration, BatteryStrategy } from '@nav/shared/models/der';
import { Meter } from '@nav/shared/models/meter';
import { Scenario } from '@nav/shared/models/scenario';
import { RootState, ModelsSlice } from '../types';


/** ============================ Actions =================================== */
type ModelType = keyof ModelsSlice;

/** Updates models en-masse */
type SetModelsAction = PayloadAction<{
  [K in ModelType]?: ModelsSlice[K];
}>;

/** Updates a single model using its `id` field */
type UpdateModelAction<M extends ModelType> = PayloadAction<
  | BatteryConfiguration
  | BatteryStrategy
  | Meter
  | Scenario
>;

/** ============================ Slice ===================================== */
const initialState = {
  derConfigurations: [],
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
    setModels: (state, action: SetModelsAction) => {
      Object.assign(state, action.payload);
    },
    updateModel: <M extends ModelType>(state: ModelsSlice, action: UpdateModelAction<M>) => {
      const model = action.payload;
      
      // Get the model's slice
      let slice: Array<typeof model>;
      switch (model.object_type) {
        case 'BatteryConfiguration':
          slice = state.derConfigurations;
          break;
        case 'BatteryStrategy':
          slice = state.derStrategies;
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
      slice.splice(modelIndex, 1, model);
    }
  }
});

/** ============================ Exports =================================== */
export const { reducer } = slice;
export const { setModels, updateModel } = slice.actions;

/**
 * A "selector creator" that accepts a type of model and returns a selector that will return the
 * models of that type
 *
 * @param {ModelType} modelType: the type of model to retrieve from the store
 */
export function selectModels <Type extends ModelType>(modelType: Type) {
  return function (state: RootState): ModelsSlice[Type] {
    return state.models[modelType];
  };
}
