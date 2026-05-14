import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  Collapse,
  Divider,
  FormControl,
  Grid,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon                    from '@mui/icons-material/Add';
import RefreshOutlinedIcon        from '@mui/icons-material/RefreshOutlined';
import FilterAltOffOutlinedIcon   from '@mui/icons-material/FilterAltOffOutlined';
import GridViewOutlinedIcon       from '@mui/icons-material/GridViewOutlined';
import ViewListOutlinedIcon       from '@mui/icons-material/ViewListOutlined';
import SearchOutlinedIcon         from '@mui/icons-material/SearchOutlined';
import FilterListOutlinedIcon     from '@mui/icons-material/FilterListOutlined';
import PlayArrowIcon              from '@mui/icons-material/PlayArrow';
import StopIcon                   from '@mui/icons-material/Stop';
import CameraAltOutlinedIcon      from '@mui/icons-material/CameraAltOutlined';
import FeedbackOutlinedIcon       from '@mui/icons-material/FeedbackOutlined';
import DnsOutlinedIcon            from '@mui/icons-material/DnsOutlined';
import ComputerOutlinedIcon       from '@mui/icons-material/ComputerOutlined';
import FileDownloadOutlinedIcon   from '@mui/icons-material/FileDownloadOutlined';
import LocationOnOutlinedIcon     from '@mui/icons-material/LocationOnOutlined';
import { useNavigate }            from 'react-router-dom';
import { jsPDF }                  from 'jspdf';
import autoTable                  from 'jspdf-autotable';

import StatCard     from '../../../components/StatCard';
import VMDataTable  from '../../../components/VMDataTable';
import CreateVMDialog from './CreateVMDialog';
import api          from '../../../services/api';

const LOCATION_KEY = 'compliance_current_location';

const VirtualMachines = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode]               = useState('list');
  const [searchValue, setSearchValue]         = useState(''); // eslint-disable-line no-unused-vars
  const [regionFilter, setRegionFilter]       = useState('');
  const [podFilter, setPodFilter]             = useState('');
  const [powerStateFilter, setPowerStateFilter] = useState('');
  const [searchInput, setSearchInput]         = useState('');
  const [createMenuAnchor, setCreateMenuAnchor] = useState(null);
  const [createPageOpen, setCreatePageOpen]   = useState(false);
  const [vms, setVms]                         = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [regions, setRegions]                 = useState([]);
  const [pods, setPods]                       = useState([]);
  const [actionAnchor, setActionAnchor]       = useState(null);
  const [actionRow, setActionRow]             = useState(null);
  const [exportAnchor, setExportAnchor]       = useState(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [successMsg, setSuccessMsg]           = useState('');

  /* Location info banner */
  const [showLocationInfo, setShowLocationInfo] = useState(!localStorage.getItem(LOCATION_KEY));

  const showBanner = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const fetchVms = useCallback((search = '', powerState = '') => {
    setLoading(true);
    const params = {};
    if (search)     params.search      = search;
    if (powerState) params.power_state = powerState;
    api.get('/vms/', { params })
      .then(({ data }) => setVms(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchVms('', '');
    api.get('/compliance/regions').then(({ data }) => setRegions(data.map(r => r.name))).catch(() => {});
    api.get('/compliance/pods').then(({ data }) => setPods(data.map(p => p.name))).catch(() => {});
  }, [fetchVms]);

  /* Debounce search input → API call */
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchValue(searchInput);
      fetchVms(searchInput, powerStateFilter);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  /* Restore saved location on mount */
  useEffect(() => {
    const saved = localStorage.getItem(LOCATION_KEY);
    if (saved) {
      try {
        const { region, pod } = JSON.parse(saved);
        if (region) setRegionFilter(region);
        if (pod)    setPodFilter(pod);
      } catch (_e) { /* ignore invalid JSON */ }
    }
  }, []);

  const handleRegionChange = (val) => {
    setRegionFilter(val);
    const saved = localStorage.getItem(LOCATION_KEY);
    const pod   = saved ? (JSON.parse(saved).pod || '') : podFilter;
    if (val) {
      localStorage.setItem(LOCATION_KEY, JSON.stringify({ region: val, pod }));
      setShowLocationInfo(false);
    } else {
      localStorage.removeItem(LOCATION_KEY);
    }
  };

  const handlePodChange = (val) => {
    setPodFilter(val);
    if (regionFilter) {
      localStorage.setItem(LOCATION_KEY, JSON.stringify({ region: regionFilter, pod: val }));
    }
  };

  const normalizedVms = useMemo(() => vms.map((v) => ({
    ...v,
    cloudPod:    v.cloud_pod   || 'Default_POD',
    vmName:      v.vm_name     || '—',
    vmUuid:      v.vm_uuid     || '—',
    powerState:  v.power_state || 'Halted',
    primaryIp:   v.primary_ip  || '192.168.1.' + (v.id % 254 + 1),
    guestOs:     v.guest_os    || 'Ubuntu 22.04 LTS',
    minCpu:      v.min_cpu     ?? 2,
    maxCpu:      v.max_cpu     ?? 8,
    minRam:      v.min_ram     ?? 4,
    maxRam:      v.max_ram     ?? 16,
    totalDisk:   v.total_disk_size ?? 100,
    totalUptime: v.power_state === 'Running' ? '99.9%' : '—',
  })), [vms]);

  const stats = useMemo(() => ({
    total:     normalizedVms.length,
    running:   normalizedVms.filter((v) => v.powerState === 'Running').length,
    halted:    normalizedVms.filter((v) => v.powerState === 'Halted').length,
    snapshots: 0,
  }), [normalizedVms]);

  const filteredVms = normalizedVms;

  const hasFilter = Boolean(powerStateFilter || searchInput);

  const handlePowerStateFilter = (val) => {
    setPowerStateFilter(val);
    setFilterMenuAnchor(null);
    fetchVms(searchInput, val);
  };

  const openCreatePage = () => { setCreateMenuAnchor(null); setCreatePageOpen(true); };
  const handleRowClick = (vm) => navigate(`/vms/${vm.id}`);

  const handleActionClick = (e, row) => { e.stopPropagation(); setActionAnchor(e.currentTarget); setActionRow(row); };
  const handleActionClose = () => { setActionAnchor(null); setActionRow(null); };

  const handleAction = async (action) => {
    handleActionClose();
    if (!actionRow) return;
    if (action === 'delete')   { await api.delete(`/vms/${actionRow.id}`).catch(() => {}); fetchVms(); return; }
    if (action === 'activate') { await api.put(`/vms/${actionRow.id}`, { power_state: 'Running' }).catch(() => {}); fetchVms(); return; }
    if (action === 'halt')     { await api.put(`/vms/${actionRow.id}`, { power_state: 'Halted' }).catch(() => {}); fetchVms(); return; }
  };

  /* Export */
  const exportCols = ['VM Name', 'UUID', 'Power State', 'Primary IP', 'Guest OS', 'Min CPU', 'Max CPU', 'Min RAM', 'Max RAM', 'Total Disk', 'Cloud POD'];
  const exportData = filteredVms.map(v => [v.vmName, v.vmUuid, v.powerState, v.primaryIp, v.guestOs, v.minCpu, v.maxCpu, v.minRam, v.maxRam, v.totalDisk, v.cloudPod]);

  const handleExportCSV = () => {
    setExportAnchor(null);
    const header = exportCols.join(',');
    const rows   = exportData.map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const blob   = new Blob([`${header}\n${rows}`], { type: 'text/csv' });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement('a'); a.href = url; a.download = 'compliance_policies.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    setExportAnchor(null);
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14);
    doc.text('Compliance Policy', 14, 15);
    autoTable(doc, { startY: 22, head: [exportCols], body: exportData, styles: { fontSize: 8 }, headStyles: { fillColor: [25, 118, 210] } });
    doc.save('compliance_policies.pdf');
  };

  if (createPageOpen) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CreateVMDialog
          onClose={() => setCreatePageOpen(false)}
          onCreated={() => { setCreatePageOpen(false); fetchVms('', ''); showBanner('Compliance policy created successfully!'); }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', px: 3, pt: 2, pb: 8 }}>

      {/* ── Success banner ── */}
      <Collapse in={Boolean(successMsg)}>
        <Alert severity="success" onClose={() => setSuccessMsg('')}
          sx={{ mb: 2, borderRadius: '8px', fontSize: 14, fontWeight: 500 }}>
          {successMsg}
        </Alert>
      </Collapse>

      {/* ── Location info banner ── */}
      <Collapse in={showLocationInfo}>
        <Alert
          severity="error"
          icon={<LocationOnOutlinedIcon fontSize="inherit" />}
          onClose={() => setShowLocationInfo(false)}
          sx={{ mb: 2, borderRadius: '8px', fontSize: 14, fontWeight: 500 }}
        >
          Please select your <strong>Region</strong> and <strong>POD</strong> from the dropdowns on the right to filter compliance policies by location.
        </Alert>
      </Collapse>

      {/* Breadcrumb */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
        <Link href="/" underline="hover" sx={{ color: '#1976d2', fontSize: 13 }}>Home</Link>
        <Typography sx={{ fontSize: 13, color: '#9e9e9e' }}>&gt;</Typography>
        <Typography sx={{ fontSize: 13, color: '#757575' }}>Compliance Policy</Typography>
      </Box>

      {/* Page title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <ComputerOutlinedIcon sx={{ fontSize: 34, color: '#1976d2' }} />
        <Typography sx={{ fontWeight: 600, fontSize: 26, color: '#1a1a1a' }}>Compliance Policy</Typography>
      </Box>

      {/* Action bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 3, flexWrap: 'wrap' }}>
        <Button variant="contained" color="primary"
          startIcon={<AddIcon sx={{ fontSize: 18 }} />}
          onClick={(e) => setCreateMenuAnchor(e.currentTarget)}
          sx={{ textTransform: 'none', fontWeight: 500, borderRadius: 1, px: 2, fontSize: 14 }}>
          Create
        </Button>

        <Menu anchorEl={createMenuAnchor} open={Boolean(createMenuAnchor)} onClose={() => setCreateMenuAnchor(null)}
          PaperProps={{ sx: { minWidth: 210, mt: 0.5, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' } }}>
          <MenuItem onClick={openCreatePage} sx={{ fontSize: 14 }}>Create Compliance Policy</MenuItem>
          <MenuItem onClick={openCreatePage} sx={{ fontSize: 14, color: '#1976d2' }}>Create Policy Manually</MenuItem>
        </Menu>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

        <Button variant="text" startIcon={<RefreshOutlinedIcon sx={{ fontSize: 17 }} />}
          onClick={() => fetchVms(searchInput, powerStateFilter)} disabled={loading}
          sx={{ textTransform: 'none', color: '#424242', fontSize: 14, fontWeight: 400, minWidth: 0 }}>
          Refresh
        </Button>

        {/* Export */}
        <Button variant="text" startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 17 }} />}
          onClick={(e) => setExportAnchor(e.currentTarget)}
          sx={{ textTransform: 'none', color: '#424242', fontSize: 14, fontWeight: 400, minWidth: 0 }}>
          Export
        </Button>
        <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}
          PaperProps={{ sx: { minWidth: 160, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' } }}>
          <MenuItem onClick={handleExportPDF} sx={{ fontSize: 13 }}>📄 Export as PDF</MenuItem>
          <MenuItem onClick={handleExportCSV} sx={{ fontSize: 13 }}>📊 Export as CSV</MenuItem>
        </Menu>

        {hasFilter && (
          <Button variant="text" startIcon={<FilterAltOffOutlinedIcon sx={{ fontSize: 17 }} />}
            onClick={() => { setPowerStateFilter(''); setSearchValue(''); setSearchInput(''); fetchVms('', ''); }}
            sx={{ textTransform: 'none', color: '#424242', fontSize: 14, fontWeight: 400, minWidth: 0, '&:hover': { color: '#1976d2' } }}>
            Remove Filter
          </Button>
        )}

        <Box sx={{ flex: 1 }} />

        {/* All Regions */}
        <FormControl size="small" sx={{ minWidth: 148 }}>
          <Select value={regionFilter} onChange={(e) => handleRegionChange(e.target.value)} displayEmpty
            renderValue={(v) => v || 'All Regions'} sx={{ fontSize: 13 }}>
            <MenuItem value="">All Regions</MenuItem>
            {regions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </Select>
        </FormControl>

        {/* All PODs */}
        <FormControl size="small" sx={{ minWidth: 126 }}>
          <Select value={podFilter} onChange={(e) => handlePodChange(e.target.value)} displayEmpty
            renderValue={(v) => v || 'All PODs'} sx={{ fontSize: 13 }}>
            <MenuItem value="">All PODs</MenuItem>
            {pods.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total Policies" value={stats.total} icon={<DnsOutlinedIcon sx={{ fontSize: 28, color: '#5b8dc9' }} />} iconBg="#dde8f5" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Active Policies" value={stats.running} icon={<PlayArrowIcon sx={{ fontSize: 28, color: '#43a047' }} />} iconBg="#e8f5e9" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Halted Policies" value={stats.halted} icon={<StopIcon sx={{ fontSize: 28, color: '#e53935' }} />} iconBg="#ffebee" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total Snapshots" value={stats.snapshots} icon={<CameraAltOutlinedIcon sx={{ fontSize: 28, color: '#9c27b0' }} />} iconBg="#f3e5f5" />
        </Grid>
      </Grid>

      {/* View toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.75, mb: 1.25 }}>
        {[{ mode: 'grid', Icon: GridViewOutlinedIcon }, { mode: 'list', Icon: ViewListOutlinedIcon }].map(({ mode, Icon }) => (
          <IconButton key={mode} size="small" onClick={() => setViewMode(mode)}
            sx={{ borderRadius: 1, border: '1px solid', borderColor: viewMode === mode ? '#1976d2' : '#d0d0d0',
              color: viewMode === mode ? '#1976d2' : '#9e9e9e', bgcolor: viewMode === mode ? '#e3f2fd' : 'transparent', p: '4px' }}>
            <Icon sx={{ fontSize: 18 }} />
          </IconButton>
        ))}
      </Box>

      {/* Search + Add Filter */}
      <Box sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by Name, UUID, IP..."
          size="small"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          InputProps={{
            startAdornment: <SearchOutlinedIcon sx={{ mr: 0.5, color: '#9e9e9e', fontSize: 17 }} />,
            sx: { fontSize: 13, borderRadius: 1 },
          }}
          sx={{ minWidth: 290 }}
        />

        {/* Add Filter button — opens a menu with PowerState options */}
        <Button
          variant="text"
          size="small"
          startIcon={<FilterListOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
          sx={{
            textTransform: 'none',
            fontSize: 13,
            color: powerStateFilter ? '#1976d2' : '#424242',
            fontWeight: powerStateFilter ? 600 : 400,
          }}
        >
          {powerStateFilter ? `Power State: ${powerStateFilter}` : 'Add Filter'}
        </Button>
        <Menu
          anchorEl={filterMenuAnchor}
          open={Boolean(filterMenuAnchor)}
          onClose={() => setFilterMenuAnchor(null)}
          PaperProps={{ sx: { minWidth: 200, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', borderRadius: 1 } }}
        >
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#9e9e9e', px: 2, pt: 1, pb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Power State
          </Typography>
          <MenuItem onClick={() => handlePowerStateFilter('')} selected={!powerStateFilter} sx={{ fontSize: 13 }}>
            All States
          </MenuItem>
          {['Running', 'Halted'].map(s => (
            <MenuItem key={s} onClick={() => handlePowerStateFilter(s)} selected={powerStateFilter === s} sx={{ fontSize: 13 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s === 'Running' ? '#43a047' : '#e53935' }} />
                {s}
              </Box>
            </MenuItem>
          ))}
        </Menu>

        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: 13, color: '#757575' }}>
          Showing {filteredVms.length} of {normalizedVms.length} Records
        </Typography>
      </Box>

      {/* Table */}
      <VMDataTable
        rows={filteredVms}
        onCreateClick={openCreatePage}
        onRowClick={handleRowClick}
        onActionClick={handleActionClick}
        emptyLabel="No Compliance Policy Found."
      />

      {/* Row action menu */}
      <Menu anchorEl={actionAnchor} open={Boolean(actionAnchor)} onClose={handleActionClose}
        PaperProps={{ sx: { minWidth: 160, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' } }}>
        <MenuItem onClick={() => handleAction('activate')} sx={{ fontSize: 13, gap: 1 }}>
          <PlayArrowIcon sx={{ fontSize: 16, color: '#43a047' }} /> Activate
        </MenuItem>
        <MenuItem onClick={() => handleAction('halt')} sx={{ fontSize: 13, gap: 1 }}>
          <StopIcon sx={{ fontSize: 16, color: '#e53935' }} /> Halt
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleActionClose} sx={{ fontSize: 13 }}>Edit</MenuItem>
        <MenuItem onClick={() => handleAction('delete')} sx={{ fontSize: 13, color: '#e53935' }}>Delete</MenuItem>
      </Menu>

      {/* Fixed Feedback */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}>
        <Button variant="contained" color="primary" size="small"
          startIcon={<FeedbackOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={() => alert('Thank you for your feedback!')}
          sx={{ textTransform: 'none', fontSize: 13, borderRadius: 2, px: 2, boxShadow: '0 2px 8px rgba(25,118,210,0.45)' }}>
          Feedback
        </Button>
      </Box>
    </Box>
  );
};

export default VirtualMachines;
