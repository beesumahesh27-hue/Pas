import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreatePas from '../../views/PasList/PasActions/CreatePas';
import { renderWithProviders } from '../utils/renderWithProviders';

function submitForm(container) {
  fireEvent.submit(container.querySelector('form'));
}

describe('CreatePas', () => {
  it('renders the page heading', () => {
    renderWithProviders(<CreatePas />);
    expect(screen.getByText('Create New Platform as a Service')).toBeInTheDocument();
  });

  it('renders Platform Name field', () => {
    renderWithProviders(<CreatePas />);
    expect(screen.getByLabelText(/Platform Name/i)).toBeInTheDocument();
  });

  it('renders Description field', () => {
    renderWithProviders(<CreatePas />);
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  it('renders the Create Platform submit button', () => {
    renderWithProviders(<CreatePas />);
    expect(screen.getByRole('button', { name: /Create Platform/i })).toBeInTheDocument();
  });

  it('renders the Back button', () => {
    renderWithProviders(<CreatePas />);
    expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
  });

  it('shows validation error when Platform Name is empty on submit', async () => {
    const { container } = renderWithProviders(<CreatePas />);
    submitForm(container);
    expect(await screen.findByText('Platform name is required')).toBeInTheDocument();
  });

  it('shows validation error when Description is empty on submit', async () => {
    const { container } = renderWithProviders(<CreatePas />);
    await userEvent.type(screen.getByLabelText(/Platform Name/i), 'My Platform');
    submitForm(container);
    expect(await screen.findByText('Description is required')).toBeInTheDocument();
  });

  it('clears Platform Name error when user starts typing', async () => {
    const { container } = renderWithProviders(<CreatePas />);
    submitForm(container);
    await screen.findByText('Platform name is required');
    await userEvent.type(screen.getByLabelText(/Platform Name/i), 'A');
    expect(screen.queryByText('Platform name is required')).not.toBeInTheDocument();
  });

  it('shows success alert after valid submission', async () => {
    const { container } = renderWithProviders(<CreatePas />);
    await userEvent.type(screen.getByLabelText(/Platform Name/i), 'My Platform');
    await userEvent.type(screen.getByLabelText(/Description/i), 'A test platform description');
    submitForm(container);
    expect(await screen.findByText('Platform created successfully!')).toBeInTheDocument();
  });

  it('calls window.close when Back button is clicked', () => {
    const closeSpy = jest.spyOn(window, 'close').mockImplementation(() => {});
    renderWithProviders(<CreatePas />);
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(closeSpy).toHaveBeenCalledTimes(1);
    closeSpy.mockRestore();
  });

  it('renders configuration summary section', () => {
    renderWithProviders(<CreatePas />);
    expect(screen.getByText('Configuration Summary')).toBeInTheDocument();
  });

  it('reflects typed platform name in the summary', async () => {
    renderWithProviders(<CreatePas />);
    await userEvent.type(screen.getByLabelText(/Platform Name/i), 'Prod API');
    expect(screen.getByText('Prod API')).toBeInTheDocument();
  });
});
