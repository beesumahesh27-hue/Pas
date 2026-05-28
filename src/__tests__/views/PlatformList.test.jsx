import React from 'react';
import { render, screen } from '@testing-library/react';
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
  it('renders without crashing', () => {
    renderPlatformList();
    expect(screen.getAllByText('Platform as a Service').length).toBeGreaterThan(0);
  });

  it('shows the Create Platform button', () => {
    renderPlatformList();
    expect(screen.getByText('Create Platform')).toBeInTheDocument();
  });
});
