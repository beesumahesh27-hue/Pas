import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';

jest.mock('../../services/insightApi', () => ({
  fetchInsightsSummary: jest.fn().mockResolvedValue({
    vms: {
      total: 10, running: 7, utilization: 70,
      status: { Running: 7, Halted: 3 },
      resources: { cpu: 40, ram: 80, disk: 500 },
      trend: [
        { label: '21 May', value: 8 },
        { label: '22 May', value: 9 },
        { label: '23 May', value: 10 },
      ],
    },
    platforms: { total: 5, running: 4, utilization: 80, status: { Active: 4, Inactive: 1 } },
    compliance: { total: 3, running: 2, utilization: 40, status: { Covered: 2, 'Not Covered': 3 } },
    jobs: {
      total: 6, running: 4, utilization: 66.7,
      status: { Upcoming: 2, Ongoing: 2, Completed: 2 },
      categories: { work: 4, personal: 2 },
    },
  }),
}));

import InsightHome from '../../views/Insight/InsightHome';

const renderPage = () =>
  render(
    <MemoryRouter>
      <InsightHome />
    </MemoryRouter>,
  );

describe('InsightHome', () => {
  it('renders the page header', () => {
    renderPage();
    // "Insights" appears in both the breadcrumb and the title row.
    expect(screen.getAllByText('Insights').length).toBeGreaterThan(0);
  });

  it('renders the summary cards and charts after loading', async () => {
    renderPage();
    expect(await screen.findByText('Virtual Machine Details')).toBeInTheDocument();
    expect(screen.getByText('Platform Compliance')).toBeInTheDocument();
    expect(screen.getByText('Virtual Machines')).toBeInTheDocument();
    expect(screen.getAllByText('Jobs').length).toBeGreaterThan(0);
  });

  it('renders under a dark theme without breaking', async () => {
    render(
      <ThemeProvider theme={createTheme({ palette: { mode: 'dark' } })}>
        <MemoryRouter>
          <InsightHome />
        </MemoryRouter>
      </ThemeProvider>,
    );
    expect(await screen.findByText('Virtual Machine Details')).toBeInTheDocument();
  });
});
