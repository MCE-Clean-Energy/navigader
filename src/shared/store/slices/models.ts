import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState, ModelsSlice } from '../types';
import { BatteryConfiguration, BatteryStrategy } from '../../models/der';


/** ============================ Slice ===================================== */
/**
 * Global UI slice. This will hold state for certain global UI state parameters, such as whether a
 * snackbar message or modal is open
 */
const slice = createSlice({
  name: 'models',
  initialState: {
    derConfigurations: [],
    derStrategies: []
  } as ModelsSlice,
  reducers: {
    setDerConfigurations: (state, action: PayloadAction<BatteryConfiguration[]>) => {
      state.derConfigurations = action.payload;
    },
    setDerStrategies: (state, action: PayloadAction<BatteryStrategy[]>) => {
      state.derStrategies = action.payload;
    }
  }
});

/** ============================ Exports =================================== */
export const { reducer } = slice;
export const { setDerConfigurations, setDerStrategies } = slice.actions;
export const selectDerConfigurations = (state: RootState) => state.models.derConfigurations;
export const selectDerStrategies = (state: RootState) => state.models.derStrategies;
