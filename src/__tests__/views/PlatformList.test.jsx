import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import axios from 'axios';

import { createTestStore } from '../utils/renderWithProviders';

jest.mock('axios');
jest.mock('jspdf', () => ({
  jsPDF: jest.fn().mockImplementation(() => ({
    autoTable: jest.fn(),
    save: jest.fn(),
    text: jest.fn(),
    setFontSize: jest.fn(),
  })),
}));
jest.mock('jspdf-autotable', () => jest.fn());

import PlatformList from '../../views/PasList/PlatformList';

beforeEach(() => {
  axios.get = jest.fn().mockResolvedValue({ data: [] });
});

const renderPlatformList = () =>
  render(
    <Provider store={createTestStore()}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <PlatformList />
      </MemoryRouter>
    </Provider>
  );

describe('PlatformList', () => {
  it('renders without crashing', async () => {
    renderPlatformList();
    await waitFor(() => {
      expect(screen.getByText('Platform as a Service')).toBeInTheDocument();
    });
  });

  it('shows the Create Platform button', async () => {
    renderPlatformList();
    await waitFor(() => {
      expect(screen.getByText('Create Platform')).toBeInTheDocument();
    });
  });
});
