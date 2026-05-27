import React from 'react';
import { render, screen } from '@testing-library/react';
import DonutChart from '../../components/charts/DonutChart';

describe('DonutChart', () => {
  const data = [
    { label: 'Running', value: 7, color: '#43a047' },
    { label: 'Halted',  value: 3, color: '#e53935' },
  ];

  it('renders a legend entry for each segment', () => {
    render(<DonutChart data={data} />);
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText('Halted')).toBeInTheDocument();
  });

  it('renders the center primary and secondary text', () => {
    render(<DonutChart data={data} centerPrimary={10} centerSecondary="Total" />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('renders without crashing when there is no data', () => {
    const { container } = render(<DonutChart data={[]} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
