import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useOutletContext: () => ({ platformData: { pas_name: 'Test Platform', pas_id: 'test-id' } }),
}));

import Overview from '../../views/PasOverview/Overview';

beforeEach(() => {
  axios.get = jest.fn().mockResolvedValue({ data: [] });
});

describe('Overview', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter initialEntries={['/test-platform']}>
        <Routes>
          <Route path="/:pasId/*" element={<Overview />} />
        </Routes>
      </MemoryRouter>
    );
  });

  it('shows the platform overview heading', () => {
    render(
      <MemoryRouter initialEntries={['/test-platform']}>
        <Routes>
          <Route path="/:pasId/*" element={<Overview />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/overview/i)).toBeInTheDocument();
  });
});
