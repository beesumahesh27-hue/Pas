import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import alertReducer from './slices/alertSlice';

const store = configureStore({
  reducer: {
    ui: uiReducer,
    alert: alertReducer,
  },
});

export default store;
