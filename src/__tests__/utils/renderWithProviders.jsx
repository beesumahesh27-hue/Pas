import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../../store/slices/uiSlice';
import alertReducer from '../../store/slices/alertSlice';

export function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: { ui: uiReducer, alert: alertReducer },
    preloadedState,
  });
}

export function renderWithProviders(ui, { store, ...renderOptions } = {}) {
  const testStore = store ?? createTestStore();

  function Wrapper({ children }) {
    return (
      <Provider store={testStore}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    );
  }

  return { store: testStore, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
