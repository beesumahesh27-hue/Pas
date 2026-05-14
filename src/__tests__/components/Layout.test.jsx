import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Layout from '../../components/Layout';

describe('Layout', () => {
  it('renders the logo text', () => {
    render(<Layout><div /></Layout>);
    expect(screen.getByText('eNlight 360°')).toBeInTheDocument();
  });

  it('renders the search bar placeholder', () => {
    render(<Layout><div /></Layout>);
    expect(
      screen.getByPlaceholderText(/Search resources and services/i)
    ).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<Layout><p>page content</p></Layout>);
    expect(screen.getByText('page content')).toBeInTheDocument();
  });

  it('renders the Admin dropdown trigger', () => {
    render(<Layout><div /></Layout>);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('opens admin menu when Admin is clicked', () => {
    render(<Layout><div /></Layout>);
    fireEvent.click(screen.getByText('Admin'));
    expect(screen.getByText('Switch Role')).toBeInTheDocument();
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
    expect(screen.getByText('Tenant')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('closes admin menu when a role is clicked', async () => {
    render(<Layout><div /></Layout>);
    fireEvent.click(screen.getByText('Admin'));
    fireEvent.click(screen.getByText('Super Admin'));
    await waitFor(() =>
      expect(screen.queryByText('Switch Role')).not.toBeInTheDocument()
    );
  });

  it('opens profile popover when avatar button is clicked', () => {
    render(<Layout><div /></Layout>);
    // The toolbar avatar wraps a PersonOutlinedIcon — click through it
    const personIcon = screen.getByTestId('PersonOutlinedIcon');
    fireEvent.click(personIcon);
    expect(screen.getByText('Mahesh Beesu')).toBeInTheDocument();
    expect(screen.getByText('mahesh.beesu@esds.co.in')).toBeInTheDocument();
    expect(screen.getByText('My Profile')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('closes profile popover when My Profile is clicked', async () => {
    render(<Layout><div /></Layout>);
    fireEvent.click(screen.getByTestId('PersonOutlinedIcon'));
    fireEvent.click(screen.getByText('My Profile'));
    await waitFor(() =>
      expect(screen.queryByText('Mahesh Beesu')).not.toBeInTheDocument()
    );
  });

  it('renders the notification icon button', () => {
    render(<Layout><div /></Layout>);
    expect(screen.getByTestId('NotificationsOutlinedIcon')).toBeInTheDocument();
  });

  it('renders the theme toggle button', () => {
    render(<Layout><div /></Layout>);
    expect(screen.getByTestId('DarkModeOutlinedIcon')).toBeInTheDocument();
  });

  it('switches to light mode icon after clicking theme toggle', () => {
    render(<Layout><div /></Layout>);
    fireEvent.click(screen.getByTestId('DarkModeOutlinedIcon').closest('button'));
    expect(screen.getByTestId('LightModeOutlinedIcon')).toBeInTheDocument();
  });
});
