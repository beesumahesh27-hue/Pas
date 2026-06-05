import React from 'react';
import { render, screen, act } from '@testing-library/react';
import CreatePas from '../../views/PasList/PasActions/CreatePas';
import api from '../../services/api';

jest.mock('../../services/api');

beforeEach(() => {
  api.get.mockResolvedValue({ data: [] });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('CreatePas', () => {
  it('renders without crashing when closed', () => {
    render(<CreatePas open={false} onClose={() => {}} onCreated={() => {}} />);
  });

  it('renders the drawer when open', async () => {
    await act(async () => {
      render(<CreatePas open={true} onClose={() => {}} onCreated={() => {}} />);
    });
    expect(screen.getByText('Create Platform')).toBeInTheDocument();
  });

  it('shows required field labels', async () => {
    await act(async () => {
      render(<CreatePas open={true} onClose={() => {}} onCreated={() => {}} />);
    });
    expect(screen.getByText('Platform Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });
});
