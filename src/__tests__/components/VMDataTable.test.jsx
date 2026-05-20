import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VMDataTable from '../../components/VMDataTable';

describe('VMDataTable', () => {
  it('renders without crashing with empty rows', () => {
    render(
      <MemoryRouter>
        <VMDataTable rows={[]} />
      </MemoryRouter>
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders rows when provided', () => {
    const rows = [{ id: 1, vmName: 'test-vm', powerState: 'Running', vmUuid: 'abc', primaryIp: '1.1.1.1', guestOs: 'Ubuntu' }];
    render(
      <MemoryRouter>
        <VMDataTable rows={rows} />
      </MemoryRouter>
    );
    expect(screen.getByText('test-vm')).toBeInTheDocument();
  });
});
