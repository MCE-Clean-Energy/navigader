import { configureStore } from '@reduxjs/toolkit';

import * as slices from './slices';


/** ============================ Store ===================================== */
export default configureStore({
  reducer: {
    models: slices.models.reducer,
    ui: slices.ui.reducer
  }
});
