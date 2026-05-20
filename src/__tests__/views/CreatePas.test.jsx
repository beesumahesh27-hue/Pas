import React from 'react';
import { render, screen } from '@testing-library/react';
import CreatePas from '../../views/PasList/PasActions/CreatePas';

describe('CreatePas', () => {
  it('renders without crashing when closed', () => {
    render(<CreatePas open={false} onClose={() => {}} onCreated={() => {}} />);
  });

  it('renders the drawer when open', () => {
    render(<CreatePas open={true} onClose={() => {}} onCreated={() => {}} />);
    expect(screen.getByText('Create Platform')).toBeInTheDocument();
  });

  it('shows required field labels', () => {
    render(<CreatePas open={true} onClose={() => {}} onCreated={() => {}} />);
    expect(screen.getByText('Platform Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });
});
