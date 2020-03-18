import { configureStore } from '@reduxjs/toolkit';

import uiReducer from './slices/ui';


/** ============================ Store ===================================== */
export default configureStore({
  reducer: {
    ui: uiReducer
  }
});
