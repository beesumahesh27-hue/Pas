import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VMDataTable, { VM_COLUMNS } from '../../components/VMDataTable';

const mockRows = [
  {
    cloudPod: 'POD-01',
    vmName: 'web-vm-1',
    vmUuid: 'uuid-001',
    powerState: 'Running',
    primaryIp: '10.0.0.1',
    guestOs: 'Ubuntu 22.04',
    minCpu: 2,
    maxCpu: 4,
    minRam: 4,
    maxRam: 8,
    totalDisk: 100,
    totalUptime: '72h',
  },
  {
    cloudPod: 'POD-02',
    vmName: 'db-vm-1',
    vmUuid: 'uuid-002',
    powerState: 'Halted',
    primaryIp: '10.0.0.2',
    guestOs: 'CentOS 8',
    minCpu: 4,
    maxCpu: 8,
    minRam: 8,
    maxRam: 16,
    totalDisk: 200,
    totalUptime: '24h',
  },
];

describe('VMDataTable', () => {
  it('renders all column headers', () => {
    render(<VMDataTable rows={mockRows} />);
    expect(screen.getByText('Cloud POD')).toBeInTheDocument();
    expect(screen.getByText('VM Name')).toBeInTheDocument();
    expect(screen.getByText('VM UUID')).toBeInTheDocument();
    expect(screen.getByText('Primary IP')).toBeInTheDocument();
    expect(screen.getByText('Guest OS')).toBeInTheDocument();
    expect(screen.getByText('Min CPU')).toBeInTheDocument();
    expect(screen.getByText('Max CPU')).toBeInTheDocument();
    expect(screen.getByText('Total Uptime')).toBeInTheDocument();
  });

  it('renders row data', () => {
    render(<VMDataTable rows={mockRows} />);
    expect(screen.getByText('web-vm-1')).toBeInTheDocument();
    expect(screen.getByText('POD-01')).toBeInTheDocument();
    expect(screen.getByText('uuid-001')).toBeInTheDocument();
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText('10.0.0.1')).toBeInTheDocument();
    expect(screen.getByText('Ubuntu 22.04')).toBeInTheDocument();
  });

  it('renders multiple rows', () => {
    render(<VMDataTable rows={mockRows} />);
    expect(screen.getByText('web-vm-1')).toBeInTheDocument();
    expect(screen.getByText('db-vm-1')).toBeInTheDocument();
  });

  it('shows empty state message when rows is empty', () => {
    render(<VMDataTable rows={[]} />);
    expect(screen.getByText('No Virtual Machine Found.')).toBeInTheDocument();
  });

  it('shows + Create link in empty state', () => {
    render(<VMDataTable rows={[]} />);
    expect(screen.getByText('+ Create')).toBeInTheDocument();
  });

  it('calls onCreateClick when + Create is clicked', () => {
    const onCreateClick = jest.fn();
    render(<VMDataTable rows={[]} onCreateClick={onCreateClick} />);
    fireEvent.click(screen.getByText('+ Create'));
    expect(onCreateClick).toHaveBeenCalledTimes(1);
  });

  it('renders — for missing field values', () => {
    const rowWithMissing = [{ vmName: 'partial-vm' }];
    render(<VMDataTable rows={rowWithMissing} />);
    expect(screen.getByText('partial-vm')).toBeInTheDocument();
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThan(0);
  });

  it('exports VM_COLUMNS with 12 columns', () => {
    expect(VM_COLUMNS).toHaveLength(12);
  });
});
