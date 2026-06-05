import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
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
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import AddOutlinedIcon           from '@mui/icons-material/AddOutlined';
import RefreshOutlinedIcon       from '@mui/icons-material/RefreshOutlined';
import SearchOutlinedIcon        from '@mui/icons-material/SearchOutlined';
import FileDownloadOutlinedIcon  from '@mui/icons-material/FileDownloadOutlined';
import DeleteOutlineIcon         from '@mui/icons-material/DeleteOutline';
import FeedbackOutlinedIcon      from '@mui/icons-material/FeedbackOutlined';
import MoreVertIcon              from '@mui/icons-material/MoreVert';
import VerifiedUserOutlinedIcon  from '@mui/icons-material/VerifiedUserOutlined';

import api from '../../services/api';
import PaginationBar from '../../components/PaginationBar';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSelector } from 'react-redux';
import { drawPdfHeader, buildCsvHeader, escapeCsvCell } from '../../services/pdfHeader';
import FeedbackDialog from '../PasOverview/Tasks/FeedbackDialog';


const ComplianceList = () => {
  const navigate = useNavigate();
  const user     = useSelector((s) => s.auth.user);

  const [submissions, setSubmissions]   = useState([]);
  const [loading, setLoading]           = useState(false);
  const [page, setPage]                 = useState(1);
  const [rowsPerPage, setRowsPerPage]   = useState(10);
  const [searchInput, setSearchInput]   = useState('');
  const [searching, setSearching]       = useState(false);
  const [menuAnchor, setMenuAnchor]     = useState(null);
  const [menuRow, setMenuRow]           = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);
  const [successMsg, setSuccessMsg]         = useState('');
  const [bannerSeverity, setBannerSeverity] = useState('success');
  const [feedbackOpen, setFeedbackOpen]     = useState(false);
  const isFirstRender = useRef(true);

  const fetchSubmissions = useCallback(async (search = '') => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      const { data } = await api.get('/compliance/submissions', { params });
      setSubmissions(data);
    } catch (_e) { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setSearching(true);
    const timer = setTimeout(() => {
      setPage(0);
      fetchSubmissions(searchInput).finally(() => setSearching(false));
    }, 400);
    return () => { clearTimeout(timer); setSearching(false); };
  }, [searchInput, fetchSubmissions]);

  const totalPages    = Math.max(1, Math.ceil(submissions.length / rowsPerPage));
  const paginatedData = submissions.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const showBanner = (msg, severity = 'success') => {
    setSuccessMsg(msg);
    setBannerSeverity(severity);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleRefresh = () => {
    setSearchInput('');
    setPage(0);
    fetchSubmissions('');
  };

  const handleDelete = async (row) => {
    setMenuAnchor(null);
    setMenuRow(null);
    if (!window.confirm(`Delete compliance submission for "${row.platform_name}"?`)) return;
    try {
      await api.delete(`/compliance/submissions/${row.id}`);
      fetchSubmissions(searchInput);
      showBanner(`Submission for "${row.platform_name}" deleted.`);
    } catch {
      showBanner('Failed to delete submission.', 'error');
    }
  };

  /* ── Export ── */
  const exportCols = ['Platform', 'Templates', 'Tags', 'Submitted At'];
  const exportRows = submissions.map(s => [
    s.platform_name,
    s.templates || '—',
    s.tags      || '—',
    new Date(s.submitted_at).toLocaleString(),
  ]);

  const handleExportCSV = () => {
    setExportAnchor(null);
    const preamble = buildCsvHeader('Compliance Service', user);
    const header   = exportCols.join(',');
    const rows     = exportRows.map(r => r.map(escapeCsvCell).join(',')).join('\n');
    const blob = new Blob([`${preamble}${header}\n${rows}`], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'compliance.csv'; a.click();
  };

  const handleExportPDF = () => {
    setExportAnchor(null);
    const doc = new jsPDF({ orientation: 'landscape' });
    const startY = drawPdfHeader(doc, 'Compliance Service', user);
    autoTable(doc, { startY, head: [exportCols], body: exportRows, styles: { fontSize: 9 }, headStyles: { fillColor: [25, 118, 210] } });
    doc.save('compliance.pdf');
  };

  const formatChips = (str, color) =>
    str ? str.split(',').filter(Boolean).map((v, i) => (
      <Chip key={i} label={v.trim()} size="small" sx={{ mr: 0.4, mb: 0.3, fontSize: 11, bgcolor: color === 'blue' ? '#e3f2fd' : '#f3e5f5', color: color === 'blue' ? '#1565c0' : '#6a1b9a' }} />
    )) : <Typography variant="body2" color="text.disabled">—</Typography>;

  return (
    <Box sx={{ width: '100%' }}>

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
          <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>Compliance Service</Typography>
        </Breadcrumbs>

        {/* ── Title row ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
          <VerifiedUserOutlinedIcon sx={{ fontSize: 36, color: '#1976d2', mr: 1.5 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.2 }}>Compliance Service</Typography>
        </Box>

        {/* ── Action toolbar ── */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2.5, flexWrap: 'wrap' }}>
          <Button variant="contained" color="primary" size="small"
            startIcon={<AddOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate('/compliances/create')}
            sx={{ textTransform: 'none', fontWeight: 500, height: 34, px: 2, borderRadius: '8px' }}>
            Create Compliance
          </Button>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

          <Button variant="text" startIcon={<RefreshOutlinedIcon sx={{ fontSize: 17 }} />}
            onClick={handleRefresh}
            sx={{ textTransform: 'none', color: '#424242', fontSize: 14, fontWeight: 400, minWidth: 0 }}>
            Refresh
          </Button>

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

        </Box>

        <Divider sx={{ mb: 2.5, borderColor: '#e0e0e0' }} />

        {/* ── Search + Filter row ── */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1.5, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by platform, template or tag..."
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
            sx={{ minWidth: 320 }}
          />

          <Box sx={{ flex: 1 }} />
          <Typography sx={{ fontSize: 13, color: '#757575', whiteSpace: 'nowrap' }}>
            Showing {submissions.length} of {submissions.length} Records
          </Typography>
        </Box>

        {/* ── Table ── */}
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
            <VerifiedUserOutlinedIcon sx={{ fontSize: 72, color: '#1976d2', opacity: 0.5 }} />
            <Typography color="text.secondary" sx={{ mt: 2, fontSize: 14 }}>Loading compliance data…</Typography>
          </Box>
        )}

        <TableContainer component={Paper} sx={{ display: loading ? 'none' : undefined }}>
          <Table>
            <TableHead sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? t.palette.grey[800] : '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Platform Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Templates</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tags</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Submitted At</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: 52 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? paginatedData.map((row) => (
                <TableRow key={row.id} hover sx={{ '& .action-icon': { opacity: 0, transition: 'opacity 0.15s' }, '&:hover .action-icon': { opacity: 1 } }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="primary">{row.platform_name}</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 220 }}>{formatChips(row.templates, 'blue')}</TableCell>
                  <TableCell sx={{ maxWidth: 220 }}>{formatChips(row.tags, 'purple')}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(row.submitted_at).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ width: 52, py: 0.5 }}>
                    <Tooltip title="Actions" arrow placement="left">
                      <IconButton className="action-icon" size="small"
                        onClick={(e) => { setMenuAnchor(e.currentTarget); setMenuRow(row); }}
                        style={{ opacity: menuRow?.id === row.id ? 1 : undefined }}
                        sx={{ color: '#757575', '&:hover': { color: '#1976d2', bgcolor: (t) => t.palette.mode === 'dark' ? t.palette.grey[700] : '#e3f2fd' } }}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No compliance submissions found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ── Pagination + Feedback ── */}
        <Box sx={{ display: loading ? 'none' : 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
          <PaginationBar
            page={page} totalPages={totalPages}
            rowsPerPage={rowsPerPage} rowsPerPageOptions={[5, 10, 25]}
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

      <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </Box>
  );
};

export default ComplianceList;
