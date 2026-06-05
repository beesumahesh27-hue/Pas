import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import { createTestStore } from '../utils/renderWithProviders';

jest.mock('jspdf', () => ({
  jsPDF: jest.fn().mockImplementation(() => ({
    autoTable: jest.fn(),
    save: jest.fn(),
    text: jest.fn(),
    setFontSize: jest.fn(),
  })),
}));
jest.mock('jspdf-autotable', () => jest.fn());

// api is globally mocked via jest.config.js → src/__mocks__/api.js
// (mockResolvedValue({ data: [] }) for all methods)

import PlatformList from '../../views/PasList/PlatformList';

const renderPlatformList = async () => {
  await act(async () => {
    render(
      <Provider store={createTestStore()}>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <PlatformList />
        </MemoryRouter>
      </Provider>
    );
  });
};

describe('PlatformList', () => {
  it('renders without crashing', async () => {
    await renderPlatformList();
    expect(screen.getAllByText('Platform as a Service').length).toBeGreaterThan(0);
  });

  it('shows the Create Platform button', async () => {
    await renderPlatformList();
    expect(screen.getByText('Create Platform')).toBeInTheDocument();
  });
});
