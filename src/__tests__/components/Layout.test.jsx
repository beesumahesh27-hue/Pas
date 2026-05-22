import React from 'react';
import { screen } from '@testing-library/react';
import Layout from '../../components/Layout';
import { renderWithProviders, createTestStore } from '../utils/renderWithProviders';

describe('Layout', () => {
  it('renders without crashing', () => {
    const store = createTestStore({
      auth: { token: null, user: null, loading: false, error: null },
    });
    renderWithProviders(
      <Layout><div data-testid="child">content</div></Layout>,
      { store },
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
