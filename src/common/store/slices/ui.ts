import { createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit';

import { Nullable } from 'navigader/types';
import _ from 'navigader/util/lodash';
import { RootState, UiSlice } from '../types';


/** ============================ Types ===================================== */
type SetMessagePayload = {
  duration?: Nullable<number>
  msg: string;
  type: 'success' | 'error';
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
      open: false
    }
  } as UiSlice,
  reducers: {
    setMessage: (state, action: PayloadAction<SetMessagePayload>) => {
      state.snackbar = _.defaults({
        ...action.payload,
        open: true
      }, {
        duration: 6000
      });
    },
    clearMessage: state => {
      delete state.snackbar.duration;
      delete state.snackbar.msg;
      delete state.snackbar.type;
    },
    closeSnackbar: state => {
      state.snackbar.open = false;
    }
  }
});

/**
 * Closes the snackbar and then clears the message following the close animation
 */
export const closeSnackbar = () => (dispatch: Dispatch) => {
  dispatch(slice.actions.closeSnackbar());
  setTimeout(() => {
    dispatch(slice.actions.clearMessage());
  }, 1000);
};

/** ============================ Exports =================================== */
export const { reducer } = slice;
export const { clearMessage, setMessage } = slice.actions;
export const selectSnackbar = (state: RootState) => state.ui.snackbar;
