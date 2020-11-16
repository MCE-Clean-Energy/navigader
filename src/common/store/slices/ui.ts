import _ from 'lodash';
import { createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit';

import { AlertType, Nullable, RootState, UiSlice } from 'navigader/types';

// The default snackbar duration in ms
const DEFAULT_DURATION = 6000;

/** ============================ Types ===================================== */
type SetMessagePayload = {
  duration?: Nullable<number>;
  msg: string;
  type: AlertType;
};

/** ============================ Slice ===================================== */
/**
 * Global UI slice. This will hold state for certain global UI state parameters, such as whether a
 * snackbar message or modal is open
 */
const slice = createSlice({
  name: 'ui',
  initialState: {
    snackbar: {
      open: false,
    },
  } as UiSlice,
  reducers: {
    clearMessage: (state) => {
      // Don't clear the message if the snackbar is still open
      if (!state.snackbar.open) {
        delete state.snackbar.duration;
        delete state.snackbar.msg;
        delete state.snackbar.type;
      }
    },
    closeSnackbar: (state) => {
      state.snackbar.open = false;
    },
    setMessage: (state, action: PayloadAction<SetMessagePayload>) => {
      state.snackbar = _.defaults(
        {
          ...action.payload,
          open: true,
        },
        {
          duration: DEFAULT_DURATION,
        }
      );
    },
  },
});

/** ============================ Actions =================================== */
/**
 * Closes the snackbar and then clears the message following the close animation
 */
export const closeSnackbar = () => (dispatch: Dispatch) => {
  dispatch(slice.actions.closeSnackbar());
  setTimeout(() => {
    dispatch(slice.actions.clearMessage());
  }, 1000);
};

export const { reducer } = slice;
export const { setMessage } = slice.actions;

/** ============================ Selectors ================================= */
export const selectSnackbar = (state: RootState) => state.ui.snackbar;
