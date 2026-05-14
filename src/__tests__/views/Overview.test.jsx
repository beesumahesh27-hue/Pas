import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Overview from '../../views/PasOverview/Overview';

let mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useOutletContext: () => ({
    platformData: {
      pas_id: '1',
      pas_name: 'Production API',
      status: 'Active',
      region: 'US-East',
      type: 'Web',
      created_date: '2024-01-15',
      users: 150,
      uptime: '99.9%',
    },
  }),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  mockNavigate = jest.fn();
});

function renderOverview() {
  return render(
    <MemoryRouter>
      <Overview />
    </MemoryRouter>
  );
}

describe('Overview', () => {
  it('renders the platform name', () => {
    renderOverview();
    expect(screen.getByText('Production API')).toBeInTheDocument();
  });

  it('renders the status chip', () => {
    renderOverview();
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0);
  });

  it('renders the region in header', () => {
    renderOverview();
    expect(screen.getAllByText(/US-East/).length).toBeGreaterThan(0);
  });

  it('renders the Uptime metric card label', () => {
    renderOverview();
    expect(screen.getAllByText('Uptime').length).toBeGreaterThan(0);
  });

  it('renders the uptime value', () => {
    renderOverview();
    expect(screen.getAllByText('99.9%').length).toBeGreaterThan(0);
  });

  it('renders the Active Users metric card', () => {
    renderOverview();
    expect(screen.getAllByText('Active Users').length).toBeGreaterThan(0);
    expect(screen.getAllByText('150').length).toBeGreaterThan(0);
  });

  it('renders the Created Date metric card', () => {
    renderOverview();
    expect(screen.getAllByText('Created Date').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2024-01-15').length).toBeGreaterThan(0);
  });

  it('renders three tabs: Overview, Instances, Activity', () => {
    renderOverview();
    expect(screen.getByRole('tab', { name: /^Overview$/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^Instances$/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^Activity$/i })).toBeInTheDocument();
  });

  it('Overview tab is active by default', () => {
    renderOverview();
    expect(screen.getByRole('tab', { name: /^Overview$/i })).toHaveAttribute('aria-selected', 'true');
  });

  it('switches to Instances tab and shows related instances table', () => {
    renderOverview();
    fireEvent.click(screen.getByRole('tab', { name: /^Instances$/i }));
    expect(screen.getByText('Related Instances')).toBeInTheDocument();
    expect(screen.getByText('Instance Name')).toBeInTheDocument();
    expect(screen.getByText('API-Server-1')).toBeInTheDocument();
  });

  it('switches to Activity tab and shows activity log', () => {
    renderOverview();
    fireEvent.click(screen.getByRole('tab', { name: /^Activity$/i }));
    expect(screen.getByText('Activity Log')).toBeInTheDocument();
    expect(screen.getByText(/Platform created on/i)).toBeInTheDocument();
  });

  it('renders Back to Platforms button', () => {
    renderOverview();
    expect(screen.getByRole('button', { name: /Back to Platforms/i })).toBeInTheDocument();
  });

  it('calls navigate("/") when Back to Platforms is clicked', () => {
    renderOverview();
    fireEvent.click(screen.getByRole('button', { name: /Back to Platforms/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
