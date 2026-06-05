import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import AddOutlinedIcon          from '@mui/icons-material/AddOutlined';
import RefreshOutlinedIcon      from '@mui/icons-material/RefreshOutlined';
import SearchOutlinedIcon       from '@mui/icons-material/SearchOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import DeleteOutlineIcon        from '@mui/icons-material/DeleteOutline';
import FeedbackOutlinedIcon     from '@mui/icons-material/FeedbackOutlined';
import MoreVertIcon             from '@mui/icons-material/MoreVert';
import FolderOutlinedIcon       from '@mui/icons-material/FolderOutlined';
import FilterAltOutlinedIcon    from '@mui/icons-material/FilterAltOutlined';

import api from '../../services/api';
import PaginationBar from '../../components/PaginationBar';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import FeedbackDialog from '../PasOverview/Tasks/FeedbackDialog';
import CreateResourceGroup from './RecycleBinActions/CreateResourceGroup';


const ResourceGroupList = () => {
  const navigate = useNavigate();
  const authUser = useSelector((s) => s.auth.user);

  const [groups, setGroups]             = useState([]);
  const [loading, setLoading]           = useState(false);
  const [page, setPage]                 = useState(1);
  const [rowsPerPage, setRowsPerPage]   = useState(10);
  const [searchInput, setSearchInput]   = useState('');
  const [searching, setSearching]       = useState(false);
  const [menuAnchor, setMenuAnchor]     = useState(null);
  const [menuRow, setMenuRow]           = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);
  const [createOpen, setCreateOpen]     = useState(false);
  const [successMsg, setSuccessMsg]         = useState('');
  const [bannerSeverity, setBannerSeverity] = useState('success');
  const [feedbackOpen, setFeedbackOpen]     = useState(false);
  const isFirstRender = useRef(true);

  const fetchGroups = useCallback(async (search = '') => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      const { data } = await api.get('/recycle-bin/resource-groups', { params });
      setGroups(data);
    } catch (_e) { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setSearching(true);
    const timer = setTimeout(() => {
      setPage(0);
      fetchGroups(searchInput).finally(() => setSearching(false));
    }, 400);
    return () => { clearTimeout(timer); setSearching(false); };
  }, [searchInput, fetchGroups]);

  const totalPages    = Math.max(1, Math.ceil(groups.length / rowsPerPage));
  const paginatedData = groups.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const showBanner = (msg, severity = 'success') => {
    setSuccessMsg(msg);
    setBannerSeverity(severity);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleRefresh = () => {
    setSearchInput('');
    setPage(0);
    fetchGroups('');
  };

  const handleDelete = async (row) => {
    setMenuAnchor(null);
    setMenuRow(null);
    if (!window.confirm(`Delete resource group "${row.name}"?`)) return;
    try {
      await api.delete(`/recycle-bin/resource-groups/${row.id}`);
      fetchGroups(searchInput);
      showBanner(`Resource group "${row.name}" deleted.`);
    } catch {
      showBanner('Failed to delete resource group.', 'error');
    }
  };

  const handleCreated = (newGroup) => {
    fetchGroups();
    showBanner(`Resource group "${newGroup.name}" created successfully.`);
  };

  /* ── Export ── */
  const exportCols = ['Name', 'Subscription', 'Location', 'Created At'];
  const exportRows = groups.map(g => [
    g.name,
    g.subscription,
    g.location,
    new Date(g.created_at).toLocaleString(),
  ]);

  const handleExportCSV = () => {
    setExportAnchor(null);
    const blob = new Blob([`${exportCols.join(',')}\n${exportRows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')}`], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'resource-groups.csv'; a.click();
  };

  const handleExportPDF = () => {
    setExportAnchor(null);
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14);
    doc.text('Resource Groups', 14, 15);
    autoTable(doc, { startY: 22, head: [exportCols], body: exportRows, styles: { fontSize: 9 }, headStyles: { fillColor: [25, 118, 210] } });
    doc.save('resource-groups.pdf');
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

      {/* ── Success / Error banner ── */}
      <Collapse in={Boolean(successMsg)}>
        <Alert severity={bannerSeverity} onClose={() => setSuccessMsg('')}
          sx={{ mx: 3, mt: 1.5, borderRadius: '8px', fontSize: 14, fontWeight: 500 }}>
          {successMsg}
        </Alert>
      </Collapse>

      <Box sx={{ p: 3, flex: 1 }}>

        {/* ── Breadcrumb ── */}
        <Breadcrumbs separator="›" sx={{ mb: 1.5, fontSize: 13 }}>
          <Link component="button" onClick={() => navigate('/dashboard')} underline="hover" sx={{ fontSize: 13, color: '#1976d2', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', p: 0 }}>Home</Link>
          <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>Resource groups</Typography>
        </Breadcrumbs>

        {/* ── Title row ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <FolderOutlinedIcon sx={{ fontSize: 32, color: '#1976d2', mr: 1.25 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.2, color: 'text.primary' }}>Resource groups</Typography>
        </Box>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 2.5, ml: 5.25 }}>
          {authUser?.email || authUser?.name || 'Default Directory'}
        </Typography>

        {/* ── Action toolbar ── */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2.5, flexWrap: 'wrap' }}>
          <Button variant="contained" color="primary" size="small"
            startIcon={<AddOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={() => setCreateOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 500, height: 34, px: 2, borderRadius: '8px' }}>
            Create
          </Button>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

          <Button variant="text" startIcon={<RefreshOutlinedIcon sx={{ fontSize: 17 }} />}
            onClick={handleRefresh}
            sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 14, fontWeight: 400, minWidth: 0 }}>
            Refresh
          </Button>

          <Button variant="text" startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 17 }} />}
            onClick={(e) => setExportAnchor(e.currentTarget)}
            sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 14, fontWeight: 400, minWidth: 0 }}>
            Export
          </Button>
          <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}
            PaperProps={{ sx: { minWidth: 140, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' } }}>
            <MenuItem onClick={handleExportPDF} sx={{ fontSize: 13, gap: 1 }}>Export as PDF</MenuItem>
            <MenuItem onClick={handleExportCSV} sx={{ fontSize: 13, gap: 1 }}>Export as CSV</MenuItem>
          </Menu>
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {/* ── Search + Filter row ── */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1.5, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Filter for any field..."
            size="small"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {searching
                    ? <CircularProgress size={15} sx={{ color: '#9e9e9e' }} />
                    : <SearchOutlinedIcon sx={{ color: '#9e9e9e', fontSize: 17 }} />}
                </InputAdornment>
              ),
              sx: { fontSize: 13, borderRadius: 1 },
            }}
            sx={{ minWidth: 280 }}
          />

          <Chip
            icon={<FilterAltOutlinedIcon sx={{ fontSize: 14 }} />}
            label="Subscription equals all"
            size="small"
            variant="outlined"
            sx={{ fontSize: 12, height: 28, borderRadius: 1 }}
          />
          <Chip
            icon={<FilterAltOutlinedIcon sx={{ fontSize: 14 }} />}
            label="Location equals all"
            size="small"
            variant="outlined"
            sx={{ fontSize: 12, height: 28, borderRadius: 1 }}
          />

          <Box sx={{ flex: 1 }} />
          <Typography sx={{ fontSize: 13, color: 'text.secondary', whiteSpace: 'nowrap' }}>
            {groups.length === 0 ? 'No records' : `Showing ${(page - 1) * rowsPerPage + 1}–${Math.min(page * rowsPerPage, groups.length)} of ${groups.length} records`}
          </Typography>
        </Box>

        {/* ── Table ── */}
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
            <FolderOutlinedIcon sx={{ fontSize: 72, color: '#1976d2', opacity: 0.5 }} />
            <Typography color="text.secondary" sx={{ mt: 2, fontSize: 14 }}>Loading resource groups…</Typography>
          </Box>
        )}

        <TableContainer component={Paper} sx={{ display: loading ? 'none' : undefined, overflowX: 'auto', '& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root': { borderBottom: 0 } }}>
          <Table sx={{ minWidth: 500 }}>
            <TableHead sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? t.palette.grey[800] : '#f5f5f5' }}>
              <TableRow>
                <TableCell padding="checkbox"><Checkbox size="small" disabled /></TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Name ↑↓</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Subscription ↑↓</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Location ↑↓</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Resources</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: 52 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? paginatedData.map((row) => (
                <TableRow key={row.id} hover sx={{ '& .action-icon': { opacity: 0, transition: 'opacity 0.15s' }, '&:hover .action-icon': { opacity: 1 } }}>
                  <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FolderOutlinedIcon sx={{ fontSize: 18, color: '#0078d4' }} />
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        color="primary"
                        sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                        onClick={() => navigate(`/recycle-bin/${row.id}`)}
                      >
                        {row.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                      {row.subscription}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{row.location}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.resource_count ?? 0}
                      size="small"
                      sx={{ height: 22, fontSize: 11, bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(25,118,210,0.2)' : '#e3f2fd', color: (t) => t.palette.mode === 'dark' ? '#90caf9' : '#1565c0' }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ width: 52, py: 0.5 }}>
                    <Tooltip title="Actions" arrow placement="left">
                      <IconButton className="action-icon" size="small"
                        onClick={(e) => { setMenuAnchor(e.currentTarget); setMenuRow(row); }}
                        style={{ opacity: menuRow?.id === row.id ? 1 : undefined }}
                        sx={{ color: 'text.secondary', '&:hover': { color: '#1976d2', bgcolor: (t) => t.palette.mode === 'dark' ? t.palette.grey[700] : '#e3f2fd' } }}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No resource groups found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ── Context menu ── */}
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)}
          onClose={() => { setMenuAnchor(null); setMenuRow(null); }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { minWidth: 150, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', borderRadius: 1 } }}>
          <MenuItem onClick={() => handleDelete(menuRow)} sx={{ fontSize: 14, gap: 1.5, py: 1, color: '#e53935' }}>
            <DeleteOutlineIcon sx={{ fontSize: 17 }} /> Delete
          </MenuItem>
        </Menu>

      </Box>

      {/* ── Pagination + Feedback pinned to bottom ── */}
      <Box sx={{
        display: loading ? 'none' : 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        py: 1.5,
        flexWrap: 'wrap',
        gap: 1,
      }}>
        <PaginationBar
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          onPageChange={setPage}
          onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(1); }}
        />
        <Button
          variant="contained"
          size="small"
          startIcon={<FeedbackOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={() => setFeedbackOpen(true)}
          sx={{ textTransform: 'none', fontSize: 13, borderRadius: 2, px: 2, boxShadow: '0 2px 8px rgba(25,118,210,0.35)' }}
        >
          Feedback
        </Button>
      </Box>

      <CreateResourceGroup
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />

      <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </Box>
  );
};

export default ResourceGroupList;
