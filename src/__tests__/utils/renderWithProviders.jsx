import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../../store/slices/uiSlice';
import alertReducer from '../../store/slices/alertSlice';
import authReducer from '../../store/slices/authSlice';

export function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: { ui: uiReducer, alert: alertReducer, auth: authReducer },
    preloadedState,
  });
}

export function renderWithProviders(ui, { store, ...renderOptions } = {}) {
  const testStore = store ?? createTestStore();

  function Wrapper({ children }) {
    return (
      <Provider store={testStore}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          {children}
        </BrowserRouter>
      </Provider>
    );
  }

  return { store: testStore, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
