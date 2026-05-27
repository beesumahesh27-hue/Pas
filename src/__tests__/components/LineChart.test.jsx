import React from 'react';
import { render, screen } from '@testing-library/react';
import LineChart from '../../components/charts/LineChart';

describe('LineChart', () => {
  const data = [
    { label: '21 May', value: 1 },
    { label: '22 May', value: 3 },
    { label: '23 May', value: 3 },
  ];

  it('renders an x-axis label for each day', () => {
    render(<LineChart data={data} />);
    expect(screen.getByText('21 May')).toBeInTheDocument();
    expect(screen.getByText('23 May')).toBeInTheDocument();
  });

  it('renders an svg polyline when there is data', () => {
    const { container } = render(<LineChart data={data} />);
    expect(container.querySelector('polyline')).toBeInTheDocument();
  });

  it('shows "No data" when empty', () => {
    render(<LineChart data={[]} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });
});
