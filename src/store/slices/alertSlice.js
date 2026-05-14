import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  open: false,
  message: '',
  severity: 'info', // 'success', 'error', 'warning', 'info'
};

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    showAlert: (state, action) => {
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity || 'info';
    },
    hideAlert: (state) => {
      state.open = false;
    },
  },
});

export const { showAlert, hideAlert } = alertSlice.actions;
export default alertSlice.reducer;
