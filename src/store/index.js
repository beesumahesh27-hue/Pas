import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import alertReducer from './slices/alertSlice';
import authReducer from './slices/authSlice';

const store = configureStore({
  reducer: {
    ui: uiReducer,
    alert: alertReducer,
    auth: authReducer,
  },
});

export default store;
