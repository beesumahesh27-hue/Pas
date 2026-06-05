import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Link,
  Menu,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import AddOutlinedIcon          from '@mui/icons-material/AddOutlined';
import RefreshOutlinedIcon      from '@mui/icons-material/RefreshOutlined';
import FeedbackOutlinedIcon     from '@mui/icons-material/FeedbackOutlined';
import SearchOutlinedIcon       from '@mui/icons-material/SearchOutlined';
import MoreVertIcon             from '@mui/icons-material/MoreVert';
import EditOutlinedIcon         from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon        from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon   from '@mui/icons-material/CheckCircleOutline';
import BlockOutlinedIcon        from '@mui/icons-material/BlockOutlined';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import FilterListOutlinedIcon   from '@mui/icons-material/FilterListOutlined';
import AppsOutlinedIcon         from '@mui/icons-material/AppsOutlined';
import CancelOutlinedIcon       from '@mui/icons-material/CancelOutlined';
import BuildOutlinedIcon        from '@mui/icons-material/BuildOutlined';
import CloudOutlinedIcon        from '@mui/icons-material/CloudOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import LocationOnOutlinedIcon   from '@mui/icons-material/LocationOnOutlined';

import api from '../../services/api';
import PaginationBar from '../../components/PaginationBar';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSelector } from 'react-redux';
import { drawPdfHeader, buildCsvHeader, escapeCsvCell } from '../../services/pdfHeader';
import CreatePas      from './PasActions/CreatePas';
import EditPas        from './PasActions/EditPas';
import FeedbackDialog from '../PasOverview/Tasks/FeedbackDialog';

const STAT_CARDS = [
  { key: 'total',       label: 'Total Platforms', color: '#1976d2', hoverBg: '#e3f2fd', border: '#90caf9', iconBg: '#ddeeff',  icon: <AppsOutlinedIcon       sx={{ fontSize: 28, color: '#1976d2' }} /> },
  { key: 'active',      label: 'Active',          color: '#43a047', hoverBg: '#e8f5e9', border: '#a5d6a7', iconBg: '#e8f5e9',  icon: <CheckCircleOutlineIcon sx={{ fontSize: 28, color: '#43a047' }} /> },
  { key: 'inactive',    label: 'Inactive',        color: '#e53935', hoverBg: '#ffebee', border: '#ef9a9a', iconBg: '#ffebee',  icon: <CancelOutlinedIcon     sx={{ fontSize: 28, color: '#e53935' }} /> },
  { key: 'maintenance', label: 'Maintenance',     color: '#fb8c00', hoverBg: '#fff3e0', border: '#ffcc80', iconBg: '#fff3e0',  icon: <BuildOutlinedIcon      sx={{ fontSize: 28, color: '#fb8c00' }} /> },
];

const LOCATION_KEY = 'pas_current_location';

const PlatformList = () => {
  const navigate = useNavigate();
  const user     = useSelector((s) => s.auth.user);

  const [page, setPage]               = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState(''); // eslint-disable-line no-unused-vars
  const [statusFilter, setStatusFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState(() => localStorage.getItem(LOCATION_KEY) || '');
  const [menuAnchor, setMenuAnchor]   = useState(null);
  const [menuRow, setMenuRow]         = useState(null);
  const [exportAnchor, setExportAnchor]     = useState(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);

  const [drawerOpen, setDrawerOpen]         = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editRow, setEditRow]               = useState(null);

  const [successMsg, setSuccessMsg]         = useState('');
  const [bannerSeverity, setBannerSeverity] = useState('success');
  const [feedbackOpen, setFeedbackOpen]     = useState(false);
  const [showLocationInfo, setShowLocationInfo] = useState(!localStorage.getItem(LOCATION_KEY));

  const [apiPlatforms, setApiPlatforms] = useState([]);
  const [apiLoading, setApiLoading]     = useState(false);
  const [regions, setRegions]           = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [searchInput, setSearchInput]   = useState('');
  const isFirstRender = useRef(true);

  const fetchPlatforms = useCallback(async (search = '', status = '') => {
    setApiLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (status) params.status = status;
      const { data } = await api.get('/platforms/', { params });
      setApiPlatforms(data);
    } catch (_e) { } finally { // eslint-disable-line no-empty
      setApiLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlatforms(); }, [fetchPlatforms]);

  useEffect(() => {
    api.get('/regions/').then(({ data }) => setRegions(data.map(r => r.name))).catch(() => {});
    api.get('/options/statuses').then(({ data }) => setStatusOptions(data.map(s => s.name))).catch(() => {});
  }, []);

  /* Debounce search input → API call */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      setSearchValue(searchInput);
      setPage(0);
      fetchPlatforms(searchInput, statusFilter);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, statusFilter, fetchPlatforms]);

  const stats = useMemo(() => ({
    total:       apiPlatforms.length,
    active:      apiPlatforms.filter(p => p.status === 'Active').length,
    inactive:    apiPlatforms.filter(p => p.status === 'Inactive').length,
    maintenance: apiPlatforms.filter(p => p.status === 'Maintenance').length,
  }), [apiPlatforms]);

  const filteredData = apiPlatforms;

  const hasActiveFilter = Boolean(searchInput || statusFilter);
  const totalPages      = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const paginatedData   = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const handleClearFilters   = ()     => { setSearchValue(''); setSearchInput(''); setStatusFilter(''); setPage(0); fetchPlatforms('', ''); };
  const handleRefresh        = ()     => { setSearchValue(''); setSearchInput(''); setStatusFilter(''); setPage(0); fetchPlatforms('', ''); };
  const handleStatusChange2  = (val)  => { setStatusFilter(val); setPage(0); setFilterMenuAnchor(null); fetchPlatforms(searchInput, val); };
  const handleLocationChange = (val)  => {
    setRegionFilter(val);
    if (val) {
      localStorage.setItem(LOCATION_KEY, val);
      setShowLocationInfo(false);
    } else {
      localStorage.removeItem(LOCATION_KEY);
    }
    setPage(0);
  };

  const handleRowClick  = (row) => navigate(`/${row.pas_id}`);
  const handleMenuOpen  = (e, row) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); setMenuRow(row); };
  const handleMenuClose = ()       => { setMenuAnchor(null); setMenuRow(null); };
  const getStatusColor  = (s) => ({ Active: 'success', Inactive: 'error', Maintenance: 'warning' }[s] ?? 'default');

  const handleDrawerOpen  = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);
  const handleEditClick   = (row) => { handleMenuClose(); setEditRow(row); setEditDrawerOpen(true); };
  const handleEditClose   = () => { setEditDrawerOpen(false); setEditRow(null); };

  const showBanner = (msg, severity = 'success') => {
    setSuccessMsg(msg);
    setBannerSeverity(severity);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleStatusChange = async (row, newStatus) => {
    handleMenuClose();
    try {
      await api.put(`/platforms/${row.id}`, { status: newStatus });
      await fetchPlatforms();
      showBanner(`"${row.pas_name}" status updated to ${newStatus}.`);
    } catch {
      showBanner('Failed to update status. Please try again.', 'error');
    }
  };

  const handleDeleteClick = async (row) => {
    handleMenuClose();
    if (!window.confirm(`Are you sure you want to delete "${row.pas_name}"?\n\nThis action cannot be undone.`)) return;
    try {
      await api.delete(`/platforms/${row.id}`);
      await fetchPlatforms();
      showBanner(`Platform "${row.pas_name}" deleted successfully!`);
    } catch {
      showBanner('Failed to delete platform. Please try again.', 'error');
    }
  };

  /* ── Export ── */
  const exportColumns = ['Platform Name', 'Status', 'Region', 'Type', 'Created Date', 'Users', 'Uptime'];
  const exportRows    = filteredData.map(r => [r.pas_name, r.status, r.region, r.type, r.created_date, r.users, r.uptime]);

  const handleExportCSV = () => {
    setExportAnchor(null);
    const preamble = buildCsvHeader('Platform as a Service', user);
    const header   = exportColumns.join(',');
    const rows     = exportRows.map(r => r.map(escapeCsvCell).join(',')).join('\n');
    const blob     = new Blob([`${preamble}${header}\n${rows}`], { type: 'text/csv' });
    const url      = URL.createObjectURL(blob);
    const a        = document.createElement('a'); a.href = url; a.download = 'platforms.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    setExportAnchor(null);
    const doc = new jsPDF({ orientation: 'landscape' });
    const startY = drawPdfHeader(doc, 'Platform as a Service', user);
    autoTable(doc, {
      startY,
      head: [exportColumns],
      body: exportRows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [25, 118, 210] },
    });
    doc.save('platforms.pdf');
  };

  return (
    <Box sx={{ width: '100%' }}>

      {/* ── Location info banner ── */}
      <Collapse in={showLocationInfo}>
        <Alert
          severity="error"
          icon={<LocationOnOutlinedIcon fontSize="inherit" />}
          onClose={() => setShowLocationInfo(false)}
          sx={{ mx: 3, mt: 1.5, borderRadius: '8px', fontSize: 14, fontWeight: 500 }}
        >
          Please select your <strong>Current Location</strong> from the dropdown on the right to filter platforms by region.
        </Alert>
      </Collapse>

      {/* ── Success / Error banner ── */}
      <Collapse in={Boolean(successMsg)}>
        <Alert severity={bannerSeverity} onClose={() => setSuccessMsg('')}
          sx={{ mx: 3, mt: 1.5, borderRadius: '8px', fontSize: 14, fontWeight: 500 }}>
          {successMsg}
        </Alert>
      </Collapse>

      <Box sx={{ p: 3 }}>

        {/* ── Breadcrumb ── */}
        <Breadcrumbs separator="›" sx={{ mb: 1.5, fontSize: 13 }}>
          <Link
            underline="hover"
            onClick={() => navigate('/dashboard')}
            sx={{ fontSize: 13, color: '#1976d2', fontWeight: 500, cursor: 'pointer' }}
          >
            Home
          </Link>
          <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>Platform as a Service</Typography>
        </Breadcrumbs>

        {/* ── Title row ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
          <CloudOutlinedIcon sx={{ fontSize: 36, color: '#1976d2', mr: 1.5 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.2 }}>Platform as a Service</Typography>
        </Box>

        {/* ── Action toolbar ── */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2.5, flexWrap: 'wrap' }}>
          <Button variant="contained" color="primary" size="small"
            startIcon={<AddOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={handleDrawerOpen}
            sx={{ textTransform: 'none', fontWeight: 500, height: 34, px: 2, borderRadius: '8px' }}>
            Create Platform
          </Button>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

          <Button variant="text" startIcon={<RefreshOutlinedIcon sx={{ fontSize: 17 }} />}
            onClick={handleRefresh}
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
            PaperProps={{ sx: { minWidth: 140, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' } }}>
            <MenuItem onClick={handleExportPDF} sx={{ fontSize: 13, gap: 1 }}>📄 Export as PDF</MenuItem>
            <MenuItem onClick={handleExportCSV} sx={{ fontSize: 13, gap: 1 }}>📊 Export as CSV</MenuItem>
          </Menu>

          {hasActiveFilter && (
            <Button variant="text" startIcon={<FilterAltOffOutlinedIcon sx={{ fontSize: 17 }} />}
              onClick={handleClearFilters}
              sx={{ textTransform: 'none', color: '#424242', fontSize: 14, fontWeight: 400, minWidth: 0, '&:hover': { color: '#1976d2' } }}>
              Remove Filter
            </Button>
          )}

          <Box sx={{ flex: 1 }} />

          {/* Current Location selector */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#1976d2' }} />
            <FormControl size="small" sx={{ minWidth: 180, height: 34, '& .MuiInputBase-root': { height: 34, borderRadius: '8px' } }}>
              <InputLabel>Current Location</InputLabel>
              <Select value={regionFilter} onChange={(e) => handleLocationChange(e.target.value)} label="Current Location">
                <MenuItem value="">All Locations</MenuItem>
                {regions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Divider sx={{ mb: 2.5, borderColor: '#e0e0e0' }} />

        {/* ── Stat cards ── */}
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          {STAT_CARDS.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.key}>
              <Card sx={{ border: `1px solid ${card.border}`, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s ease',
                '&:hover': { bgcolor: card.hoverBg, borderColor: card.color, boxShadow: `0 4px 16px ${card.color}40`, transform: 'translateY(-3px)' } }}>
                <CardContent sx={{ px: 3, py: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 1 }}>{card.label}</Typography>
                      <Typography sx={{ fontSize: 36, fontWeight: 700, color: card.color, lineHeight: 1 }}>{stats[card.key]}</Typography>
                    </Box>
                    <Box sx={{ bgcolor: card.iconBg, borderRadius: 2, width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {card.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* ── Search + Filter row ── */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1.5, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by name or ID..."
            size="small"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: <SearchOutlinedIcon sx={{ mr: 0.5, color: '#9e9e9e', fontSize: 17 }} />,
              sx: { fontSize: 13, borderRadius: 1 },
            }}
            sx={{ minWidth: 290 }}
          />

          <Button
            variant="text"
            size="small"
            startIcon={<FilterListOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
            sx={{
              textTransform: 'none',
              fontSize: 13,
              color: statusFilter ? '#1976d2' : '#424242',
              fontWeight: statusFilter ? 600 : 400,
            }}
          >
            {statusFilter ? `Status: ${statusFilter}` : 'Add Filter'}
          </Button>
          <Menu
            anchorEl={filterMenuAnchor}
            open={Boolean(filterMenuAnchor)}
            onClose={() => setFilterMenuAnchor(null)}
            PaperProps={{ sx: { minWidth: 200, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', borderRadius: 1 } }}
          >
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#9e9e9e', px: 2, pt: 1, pb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Status
            </Typography>
            <MenuItem onClick={() => handleStatusChange2('')} selected={!statusFilter} sx={{ fontSize: 13 }}>
              All Status
            </MenuItem>
            {statusOptions.map(s => {
              const dot = s === 'Active' ? '#43a047' : s === 'Inactive' ? '#e53935' : '#fb8c00';
              return (
                <MenuItem key={s} onClick={() => handleStatusChange2(s)} selected={statusFilter === s} sx={{ fontSize: 13 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dot }} />
                    {s}
                  </Box>
                </MenuItem>
              );
            })}
          </Menu>

          <Box sx={{ flex: 1 }} />
          <Typography sx={{ fontSize: 13, color: '#757575', whiteSpace: 'nowrap' }}>
            Showing {filteredData.length} of {apiPlatforms.length} Records
          </Typography>
        </Box>

        {/* ── Table ── */}
        {apiLoading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
            <CloudOutlinedIcon sx={{ fontSize: 72, color: '#1976d2', animation: 'spin 1.4s linear infinite', '@keyframes spin': { '0%': { opacity: 1 }, '50%': { opacity: 0.4 }, '100%': { opacity: 1 } } }} />
            <Typography color="text.secondary" sx={{ mt: 2, fontSize: 14 }}>Loading platforms…</Typography>
          </Box>
        )}
        <TableContainer component={Paper} sx={{ display: apiLoading ? 'none' : undefined }}>
          <Table>
            <TableHead sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? t.palette.grey[800] : '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Platform Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Current Location</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Created Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Users</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Uptime</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: 52 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? paginatedData.map((row) => (
                <TableRow key={row.pas_id} hover sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f9f9f9' }, '& .action-icon': { opacity: 0, transition: 'opacity 0.15s' }, '&:hover .action-icon': { opacity: 1 } }}
                  onClick={() => handleRowClick(row)}>
                  <TableCell><Link underline="hover" sx={{ fontWeight: 500, color: 'primary.main' }}>{row.pas_name}</Link></TableCell>
                  <TableCell><Chip label={row.status} color={getStatusColor(row.status)} size="small" variant="outlined" /></TableCell>
                  <TableCell>{row.region}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.created_date}</TableCell>
                  <TableCell align="center">{row.users ?? 0}</TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ color: parseFloat(row.uptime) > 99 ? '#4caf50' : '#ff9800' }}>{row.uptime}</Typography>
                  </TableCell>
                  <TableCell align="center" onClick={(e) => e.stopPropagation()} sx={{ width: 52, py: 0.5 }}>
                    <Tooltip title="Actions" arrow placement="left">
                      <IconButton className="action-icon" size="small"
                        onClick={(e) => handleMenuOpen(e, row)}
                        style={{ opacity: menuRow?.pas_id === row.pas_id ? 1 : undefined }}
                        sx={{ color: '#757575', '&:hover': { color: '#1976d2', bgcolor: '#e3f2fd' } }}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No platforms found matching your criteria</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ── Pagination ── */}
        <Box sx={{ display: apiLoading ? 'none' : 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
          <PaginationBar
            page={page} totalPages={totalPages}
            rowsPerPage={rowsPerPage} rowsPerPageOptions={[5, 10, 25]}
            onPageChange={setPage}
            onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(1); }}
          />
          <Button variant="contained" color="primary" size="small"
            startIcon={<FeedbackOutlinedIcon />}
            onClick={() => setFeedbackOpen(true)}
            sx={{ textTransform: 'none', borderRadius: 2, px: 2 }}>
            Feedback
          </Button>
        </Box>

        {/* ── Context menu ── */}
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { minWidth: 168, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', borderRadius: 1 } }}>
          <MenuItem onClick={() => handleEditClick(menuRow)} sx={{ fontSize: 14, gap: 1.5, py: 1 }}>
            <EditOutlinedIcon sx={{ fontSize: 17, color: '#1976d2' }} /> Edit
          </MenuItem>
          {menuRow?.status === 'Active' ? (
            <MenuItem onClick={() => handleStatusChange(menuRow, 'Inactive')} sx={{ fontSize: 14, gap: 1.5, py: 1 }}>
              <BlockOutlinedIcon sx={{ fontSize: 17, color: '#fb8c00' }} /> Deactivate
            </MenuItem>
          ) : (
            <MenuItem onClick={() => handleStatusChange(menuRow, 'Active')} sx={{ fontSize: 14, gap: 1.5, py: 1 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 17, color: '#43a047' }} /> Set Active
            </MenuItem>
          )}
          {menuRow?.status !== 'Maintenance' && (
            <MenuItem onClick={() => handleStatusChange(menuRow, 'Maintenance')} sx={{ fontSize: 14, gap: 1.5, py: 1 }}>
              <BuildOutlinedIcon sx={{ fontSize: 17, color: '#fb8c00' }} /> Set Maintenance
            </MenuItem>
          )}
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={() => handleDeleteClick(menuRow)} sx={{ fontSize: 14, gap: 1.5, py: 1, color: '#e53935' }}>
            <DeleteOutlineIcon sx={{ fontSize: 17 }} /> Delete
          </MenuItem>
        </Menu>

        <CreatePas open={drawerOpen} onClose={handleDrawerClose} onCreated={() => { fetchPlatforms(); showBanner('Platform created successfully!'); }} />
        <EditPas   open={editDrawerOpen} onClose={handleEditClose} onUpdated={() => { fetchPlatforms(); showBanner('Platform updated successfully!'); }} platform={editRow} />
        <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />

      </Box>
    </Box>
  );
};

export default PlatformList;
