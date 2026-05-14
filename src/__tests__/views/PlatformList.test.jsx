import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

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

describe('PlatformList', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <PlatformList />
      </MemoryRouter>
    );
    expect(screen.getAllByText('Platform as a Service').length).toBeGreaterThan(0);
  });

  it('shows the Create Platform button', () => {
    render(
      <MemoryRouter>
        <PlatformList />
      </MemoryRouter>
    );
    expect(screen.getByText('Create Platform')).toBeInTheDocument();
  });
});
