import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlatformList from '../../views/PasList/PlatformList';
import { renderWithProviders } from '../utils/renderWithProviders';
import { pasMockInstances } from '../../constants/mockData';

describe('PlatformList', () => {
  it('renders the page heading', () => {
    renderWithProviders(<PlatformList />);
    expect(screen.getByRole('heading', { name: /Platform as a Service/i })).toBeInTheDocument();
  });

  it('renders Total Platforms stat card', () => {
    renderWithProviders(<PlatformList />);
    expect(screen.getByText('Total Platforms')).toBeInTheDocument();
  });

  it('renders Inactive stat card', () => {
    renderWithProviders(<PlatformList />);
    expect(screen.getAllByText('Inactive').length).toBeGreaterThan(0);
  });

  it('renders Maintenance stat card', () => {
    renderWithProviders(<PlatformList />);
    expect(screen.getAllByText('Maintenance').length).toBeGreaterThan(0);
  });

  it('renders correct total platforms count', () => {
    renderWithProviders(<PlatformList />);
    expect(screen.getByText(String(pasMockInstances.length))).toBeInTheDocument();
  });

  it('renders Platform Name column header', () => {
    renderWithProviders(<PlatformList />);
    expect(screen.getByText('Platform Name')).toBeInTheDocument();
  });

  it('renders Region column header', () => {
    renderWithProviders(<PlatformList />);
    // "Region" appears as column header and as filter label — confirm at least one exists
    expect(screen.getAllByText('Region').length).toBeGreaterThan(0);
  });

  it('renders Created Date column header', () => {
    renderWithProviders(<PlatformList />);
    expect(screen.getByText('Created Date')).toBeInTheDocument();
  });

  it('renders platform rows from mock data', () => {
    renderWithProviders(<PlatformList />);
    expect(screen.getByText('Production API')).toBeInTheDocument();
  });

  it('renders Create Platform button', () => {
    renderWithProviders(<PlatformList />);
    expect(screen.getByRole('button', { name: /Create Platform/i })).toBeInTheDocument();
  });

  it('opens create drawer when Create Platform is clicked', async () => {
    renderWithProviders(<PlatformList />);
    fireEvent.click(screen.getByRole('button', { name: /Create Platform/i }));
    expect(await screen.findByText('Create New Platform')).toBeInTheDocument();
  });

  it('closes drawer when Cancel is clicked', async () => {
    renderWithProviders(<PlatformList />);
    fireEvent.click(screen.getByRole('button', { name: /Create Platform/i }));
    await screen.findByText('Create New Platform');
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    await waitFor(() =>
      expect(screen.queryByText('Create New Platform')).not.toBeInTheDocument()
    );
  });

  it('filters rows by search query', async () => {
    renderWithProviders(<PlatformList />);
    const search = screen.getByPlaceholderText(/Search by name or ID/i);
    await userEvent.type(search, 'Production API');
    expect(screen.getByText('Production API')).toBeInTheDocument();
    expect(screen.queryByText('Dev Environment')).not.toBeInTheDocument();
  });

  it('shows no records message when search has no match', async () => {
    renderWithProviders(<PlatformList />);
    const search = screen.getByPlaceholderText(/Search by name or ID/i);
    await userEvent.type(search, 'zzzznonexistent');
    expect(screen.getByText('No records found')).toBeInTheDocument();
  });

  it('shows Remove Filter button when search is active', async () => {
    renderWithProviders(<PlatformList />);
    const search = screen.getByPlaceholderText(/Search by name or ID/i);
    await userEvent.type(search, 'API');
    expect(screen.getByRole('button', { name: /Remove Filter/i })).toBeInTheDocument();
  });

  it('clears search when Remove Filter is clicked', async () => {
    renderWithProviders(<PlatformList />);
    const search = screen.getByPlaceholderText(/Search by name or ID/i);
    await userEvent.type(search, 'Production API');
    fireEvent.click(screen.getByRole('button', { name: /Remove Filter/i }));
    expect(search).toHaveValue('');
  });

  it('shows drawer validation error for empty platform name', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PlatformList />);
    fireEvent.click(screen.getByRole('button', { name: /Create Platform/i }));
    await screen.findByText('Create New Platform');
    const saveBtn = screen.getByRole('button', { name: /^Create Platform$/i });
    await user.click(saveBtn);
    expect(await screen.findByText('Platform name is required')).toBeInTheDocument();
  });
});
