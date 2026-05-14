import React from 'react';
import { render, screen } from '@testing-library/react';
import StatCard from '../../components/StatCard';

describe('StatCard', () => {
  const defaultProps = {
    label: 'Total Platforms',
    value: 42,
    icon: <span data-testid="icon">icon</span>,
    iconBg: '#ddeeff',
  };

  it('renders the label', () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByText('Total Platforms')).toBeInTheDocument();
  });

  it('renders the value', () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders the icon', () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders with a string value', () => {
    render(<StatCard {...defaultProps} value="99.9%" />);
    expect(screen.getByText('99.9%')).toBeInTheDocument();
  });

  it('renders with zero value', () => {
    render(<StatCard {...defaultProps} value={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
