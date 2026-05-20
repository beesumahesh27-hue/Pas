import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../../components/Layout';

describe('Layout', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <Layout><div data-testid="child">content</div></Layout>
      </MemoryRouter>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
