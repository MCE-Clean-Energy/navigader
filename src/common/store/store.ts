import { configureStore } from '@reduxjs/toolkit';

import * as slices from './slices';

/** ============================ Store ===================================== */
export function makeStore() {
  return configureStore({
    reducer: {
      models: slices.models.reducer,
      ui: slices.ui.reducer,
    },
  });
}

export default makeStore();
