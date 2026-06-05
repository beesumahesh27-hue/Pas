import React, { useState, useEffect, useCallback } from 'react';
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
  Tabs,
  Tab,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

import AddOutlinedIcon              from '@mui/icons-material/AddOutlined';
import RefreshOutlinedIcon          from '@mui/icons-material/RefreshOutlined';
import SearchOutlinedIcon           from '@mui/icons-material/SearchOutlined';
import DeleteOutlineIcon            from '@mui/icons-material/DeleteOutline';
import MoreHorizIcon                from '@mui/icons-material/MoreHoriz';
import BoltOutlinedIcon             from '@mui/icons-material/BoltOutlined';
import StopOutlinedIcon             from '@mui/icons-material/StopOutlined';
import RestartAltIcon               from '@mui/icons-material/RestartAlt';
import SwapHorizOutlinedIcon        from '@mui/icons-material/SwapHorizOutlined';
import FileDownloadOutlinedIcon     from '@mui/icons-material/FileDownloadOutlined';
import SettingsBackupRestoreOutlinedIcon from '@mui/icons-material/SettingsBackupRestoreOutlined';
import OpenInBrowserOutlinedIcon    from '@mui/icons-material/OpenInBrowserOutlined';
import ListAltOutlinedIcon          from '@mui/icons-material/ListAltOutlined';
import VpnKeyOutlinedIcon           from '@mui/icons-material/VpnKeyOutlined';
import LabelOutlinedIcon            from '@mui/icons-material/LabelOutlined';
import HealthAndSafetyOutlinedIcon  from '@mui/icons-material/HealthAndSafetyOutlined';
import ShieldOutlinedIcon           from '@mui/icons-material/ShieldOutlined';
import TerminalOutlinedIcon         from '@mui/icons-material/TerminalOutlined';
import KeyOutlinedIcon              from '@mui/icons-material/KeyOutlined';
import FolderOpenOutlinedIcon       from '@mui/icons-material/FolderOpenOutlined';
import RouterOutlinedIcon           from '@mui/icons-material/RouterOutlined';
import RocketLaunchOutlinedIcon     from '@mui/icons-material/RocketLaunchOutlined';
import KeyboardDoubleArrowLeftIcon  from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import PushPinOutlinedIcon          from '@mui/icons-material/PushPinOutlined';
import StarBorderOutlinedIcon       from '@mui/icons-material/StarBorderOutlined';
import CloseIcon                    from '@mui/icons-material/Close';
import KeyboardArrowDownIcon        from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon          from '@mui/icons-material/KeyboardArrowUp';
import FeedbackOutlinedIcon         from '@mui/icons-material/FeedbackOutlined';

import api from '../../services/api';
import PaginationBar from '../../components/PaginationBar';
import CreateFunction from './RecycleBinActions/CreateFunction';
import FeedbackDialog from '../PasOverview/Tasks/FeedbackDialog';


const NAV_SECTIONS = [
  {
    items: [
      { key: 'overview', label: 'Overview',                     icon: <BoltOutlinedIcon         sx={{ fontSize: 18 }} /> },
      { key: 'activity', label: 'Activity log',                 icon: <ListAltOutlinedIcon      sx={{ fontSize: 18 }} /> },
      { key: 'iam',      label: 'Access control (IAM)',         icon: <VpnKeyOutlinedIcon       sx={{ fontSize: 18 }} /> },
      { key: 'tags',     label: 'Tags',                         icon: <LabelOutlinedIcon        sx={{ fontSize: 18 }} /> },
      { key: 'diagnose', label: 'Diagnose and solve problems',  icon: <HealthAndSafetyOutlinedIcon sx={{ fontSize: 18 }} /> },
      { key: 'defender', label: 'Microsoft Defender for Cloud', icon: <ShieldOutlinedIcon       sx={{ fontSize: 18 }} /> },
      { key: 'events',   label: 'Events (preview)',             icon: <BoltOutlinedIcon         sx={{ fontSize: 18, color: '#ffa500' }} /> },
      { key: 'logs',     label: 'Log stream',                   icon: <TerminalOutlinedIcon     sx={{ fontSize: 18 }} /> },
    ],
  },
  {
    header: 'Functions',
    items: [
      { key: 'app-keys',  label: 'App keys', icon: <KeyOutlinedIcon        sx={{ fontSize: 18, color: '#fbc02d' }} /> },
      { key: 'app-files', label: 'App files', icon: <FolderOpenOutlinedIcon sx={{ fontSize: 18, color: '#1976d2' }} /> },
      { key: 'proxies',   label: 'Proxies',   icon: <RouterOutlinedIcon     sx={{ fontSize: 18, color: '#bdbdbd' }} />, disabled: true },
    ],
  },
  {
    header: 'Deployment',
    items: [
      { key: 'slots', label: 'Deployment slots', icon: <RocketLaunchOutlinedIcon sx={{ fontSize: 18, color: '#43a047' }} /> },
    ],
  },
];

/* Compact Azure-style pagination — shared with ResourceGroupDetail */


const FunctionAppDetail = () => {
  const navigate = useNavigate();
  const { groupId, resourceId } = useParams();

  const [group, setGroup]                 = useState(null);
  const [resource, setResource]           = useState(null);
  const [functions, setFunctions]         = useState([]);
  const [loading, setLoading]             = useState(false);
  const [page, setPage]                   = useState(1);
  const ROWS_PER_PAGE                     = 10;
  const [navSearch, setNavSearch]         = useState('');
  const [activeNav, setActiveNav]         = useState('overview');
  const [tab, setTab]                     = useState(0);
  const [menuAnchor, setMenuAnchor]       = useState(null);
  const [menuRow, setMenuRow]             = useState(null);
  const [createOpen, setCreateOpen]       = useState(false);
  const [subNavCollapsed, setSubNavCollapsed] = useState(false);
  const [essentialsOpen, setEssentialsOpen]   = useState(true);
  const [successMsg, setSuccessMsg]         = useState('');
  const [bannerSeverity, setBannerSeverity] = useState('success');
  const [feedbackOpen, setFeedbackOpen]     = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: g }, { data: r }, { data: fns }] = await Promise.all([
        api.get(`/recycle-bin/resource-groups/${groupId}`),
        api.get(`/recycle-bin/resources/${resourceId}`),
        api.get(`/recycle-bin/resources/${resourceId}/functions`),
      ]);
      setGroup(g);
      setResource(r);
      setFunctions(fns);
    } catch (_e) { /* ignore */ } finally {
      setLoading(false);
    }
  }, [groupId, resourceId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showBanner = (msg, severity = 'success') => {
    setSuccessMsg(msg);
    setBannerSeverity(severity);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const filtered = functions;
  const totalPages    = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginatedData = filtered.slice((page - 1) * ROWS_PER_PAGE, (page - 1) * ROWS_PER_PAGE + ROWS_PER_PAGE);

  const handleDeleteFunction = async (row) => {
    setMenuAnchor(null);
    setMenuRow(null);
    if (!window.confirm(`Delete function "${row.name}"?`)) return;
    try {
      await api.delete(`/recycle-bin/functions/${row.id}`);
      fetchData();
      showBanner(`Function "${row.name}" deleted.`);
    } catch {
      showBanner('Failed to delete function.', 'error');
    }
  };

  const handleDeleteResource = async () => {
    if (!window.confirm(`Delete function app "${resource?.name}"?`)) return;
    try {
      await api.delete(`/recycle-bin/resources/${resourceId}`);
      navigate(`/recycle-bin/${groupId}`);
    } catch {
      showBanner('Failed to delete function app.', 'error');
    }
  };

  /* ── Essentials grid item ── */
  const EssRow = ({ label, value, linkHref }) => (
    <Box sx={{ mb: 1.5 }}>
      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
        {label} {linkHref && <Link href={linkHref} underline="hover" sx={{ fontSize: 12, color: '#1976d2' }}>(move)</Link>}
      </Typography>
      <Box sx={{ fontSize: 13, color: 'text.primary', mt: 0.25 }}>
        {value ?? <Box sx={{ height: 8 }} />}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

      <Collapse in={Boolean(successMsg)}>
        <Alert severity={bannerSeverity} onClose={() => setSuccessMsg('')}
          sx={{ mx: 3, mt: 1.5, borderRadius: '8px', fontSize: 14, fontWeight: 500 }}>
          {successMsg}
        </Alert>
      </Collapse>

      {/* ── Top breadcrumb ── */}
      <Box sx={{ px: 3, pt: 2, pb: 1, bgcolor: 'background.paper' }}>
        <Breadcrumbs separator="›" sx={{ fontSize: 13 }}>
          <Link component="button" onClick={() => navigate('/dashboard')} underline="hover" sx={{ fontSize: 13, color: '#1976d2', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', p: 0 }}>Home</Link>
          <Link component="button" onClick={() => navigate('/recycle-bin')} underline="hover" sx={{ fontSize: 13, color: '#1976d2', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', p: 0 }}>Resource groups</Link>
          <Link component="button" onClick={() => navigate(`/recycle-bin/${groupId}`)} underline="hover" sx={{ fontSize: 13, color: '#1976d2', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', p: 0 }}>
            {group?.name || '...'}
          </Link>
        </Breadcrumbs>
      </Box>

      {/* ── Full layout: title spans pane 1 → pane 2, then side-by-side below ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, bgcolor: 'background.paper' }}>

        {/* ── FULL-WIDTH title row spanning pane 1 → pane 2 ── */}
        <Box sx={{ height: 64, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1.5, px: 2, boxSizing: 'border-box' }}>
          <BoltOutlinedIcon sx={{ fontSize: 42, color: '#ffa500', flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
                {resource?.name || 'Function App'}
              </Typography>
              <IconButton size="small" sx={{ color: '#757575', p: 0.25, '&:hover': { color: '#1976d2' } }}><PushPinOutlinedIcon sx={{ fontSize: 15 }} /></IconButton>
              <IconButton size="small" sx={{ color: '#757575', p: 0.25, '&:hover': { color: '#fb8c00' } }}><StarBorderOutlinedIcon sx={{ fontSize: 15 }} /></IconButton>
              <IconButton size="small" sx={{ color: '#757575', p: 0.25 }}><MoreHorizIcon sx={{ fontSize: 15 }} /></IconButton>
            </Box>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.2 }}>Function App</Typography>
          </Box>
          <Tooltip title="Close" arrow>
            <IconButton size="small" onClick={() => navigate(`/recycle-bin/${groupId}`)}
              sx={{ color: '#757575', transition: 'all 0.15s', '&:hover': { color: '#fff', bgcolor: '#e53935' }, flexShrink: 0 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* ── Pane 1 + Pane 2 side-by-side ── */}
        <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>

          {/* ═════ Pane 1: Sub-navigation rail ═════ */}
          <Box sx={(t) => ({ width: subNavCollapsed ? 44 : 250, flexShrink: 0, bgcolor: t.palette.mode === 'dark' ? t.palette.grey[900] : '#f8f9fa', display: 'flex', flexDirection: 'column', transition: 'width 0.15s ease' })}>

            {/* Search + collapse — 44px with border-bottom */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.25, height: 44, boxSizing: 'border-box', borderBottom: '1px solid #e0e0e0', flexShrink: 0 }}>
              {!subNavCollapsed && (
                <TextField placeholder="Search" size="small" fullWidth value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchOutlinedIcon sx={{ color: '#9e9e9e', fontSize: 16 }} /></InputAdornment>,
                    sx: { fontSize: 12, borderRadius: 1, height: 30 },
                  }}
                />
              )}
              <Tooltip title={subNavCollapsed ? 'Expand' : 'Collapse'} arrow>
                <IconButton size="small" onClick={() => setSubNavCollapsed(c => !c)} sx={{ p: 0.5, flexShrink: 0 }}>
                  {subNavCollapsed ? <KeyboardDoubleArrowRightIcon fontSize="small" /> : <KeyboardDoubleArrowLeftIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>

            {!subNavCollapsed && (
              <Box sx={{
                flex: 1, overflowY: 'auto', pb: 1,
                borderRight: '1px solid', borderColor: 'divider',
                scrollbarWidth: 'thin',
                scrollbarColor: '#c0c0c0 transparent',
                '&::-webkit-scrollbar': { width: 5 },
                '&::-webkit-scrollbar-thumb': { bgcolor: '#c0c0c0', borderRadius: 3 },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
              }}>
                {NAV_SECTIONS.map((section, sIdx) => {
                  const filteredItems = section.items.filter(it =>
                    !navSearch || it.label.toLowerCase().includes(navSearch.toLowerCase())
                  );
                  if (filteredItems.length === 0 && navSearch) return null;
                  return (
                    <Box key={sIdx} sx={{ mb: 0.5 }}>
                      {section.header && (
                        <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary', px: 2, pt: 1.5, pb: 0.5 }}>
                          {section.header}
                        </Typography>
                      )}
                      {filteredItems.map((item) => {
                        const isActive = activeNav === item.key;
                        return (
                          <Box key={item.key} onClick={() => !item.disabled && setActiveNav(item.key)}
                            sx={{
                              display: 'flex', alignItems: 'center', gap: 1.25, px: 2, py: 0.875,
                              cursor: item.disabled ? 'default' : 'pointer',
                              borderLeft: isActive ? '3px solid #1976d2' : '3px solid transparent',
                              bgcolor: isActive ? (t) => t.palette.mode === 'dark' ? 'rgba(25,118,210,0.15)' : '#e3f2fd' : 'transparent',
                              color: item.disabled ? 'text.disabled' : (isActive ? 'primary.main' : 'text.primary'),
                              opacity: item.disabled ? 0.7 : 1,
                              '&:hover': item.disabled ? {} : { bgcolor: isActive ? (t) => t.palette.mode === 'dark' ? 'rgba(25,118,210,0.15)' : '#e3f2fd' : 'action.hover' },
                            }}
                          >
                            <Box sx={{ display: 'flex' }}>{item.icon}</Box>
                            <Typography sx={{ fontSize: 12.5, fontWeight: isActive ? 500 : 400, color: 'inherit' }}>{item.label}</Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* ═════ Pane 2: Content ═════ */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, bgcolor: 'background.paper', overflowY: 'auto' }}>

          {/* Toolbar — single row, no wrap, Browse flush to left border */}
          <Box sx={{
            display: 'flex',
            gap: 0.25,
            alignItems: 'center',
            flexWrap: 'nowrap',
            pl: 1,
            pr: 2,
            height: 44,
            flexShrink: 0,
            overflowX: 'auto',
            borderBottom: '1px solid #e0e0e0',
            boxSizing: 'border-box',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}>
            <Button variant="text" startIcon={<OpenInBrowserOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 13, fontWeight: 400, minWidth: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>
              Browse
            </Button>
            <Button variant="text" startIcon={<RefreshOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={fetchData}
              sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 13, fontWeight: 400, minWidth: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>
              Refresh
            </Button>
            <Button variant="text" startIcon={<StopOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 13, fontWeight: 400, minWidth: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>
              Stop
            </Button>
            <Button variant="text" startIcon={<RestartAltIcon sx={{ fontSize: 16 }} />}
              sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 13, fontWeight: 400, minWidth: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>
              Restart
            </Button>
            <Button variant="text" startIcon={<SwapHorizOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 13, fontWeight: 400, minWidth: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>
              Swap
            </Button>
            <Button variant="text" startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 13, fontWeight: 400, minWidth: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>
              Get publish profile
            </Button>
            <Button variant="text" startIcon={<SettingsBackupRestoreOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 13, fontWeight: 400, minWidth: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>
              Reset publish profile
            </Button>
            <Button variant="text" startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 13, fontWeight: 400, minWidth: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>
              Download app content
            </Button>
            <Button variant="text" startIcon={<DeleteOutlineIcon sx={{ fontSize: 16 }} />}
              onClick={handleDeleteResource}
              sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 13, fontWeight: 400, minWidth: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>
              Delete
            </Button>
            <IconButton size="small" sx={{ ml: 0.5, flexShrink: 0 }}><MoreHorizIcon fontSize="small" /></IconButton>
          </Box>

          {/* Essentials section */}
          <Box sx={{ px: 3, py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <IconButton size="small" onClick={() => setEssentialsOpen(o => !o)} sx={{ p: 0.25, color: 'text.secondary' }}>
                {essentialsOpen ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
              </IconButton>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary', cursor: 'pointer' }}
                onClick={() => setEssentialsOpen(o => !o)}>
                Essentials
              </Typography>
              <Box sx={{ flex: 1 }} />
              <Link href="#" underline="hover" sx={{ fontSize: 13, color: '#1976d2' }}>JSON View</Link>
            </Box>

            <Collapse in={essentialsOpen}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, mb: 1 }}>
                {/* Left column */}
                <Box>
                  <EssRow
                    label="Resource group"
                    linkHref={`/recycle-bin/${groupId}`}
                    value={
                      <Link href={`/recycle-bin/${groupId}`} underline="hover" sx={{ fontSize: 13, color: '#1976d2' }}>
                        {group?.name || '—'}
                      </Link>
                    }
                  />
                  <EssRow label="Status" value={resource?.status || '—'} />
                  <EssRow label="Location" linkHref="#" value={resource?.location || '—'} />
                  <EssRow
                    label="Subscription"
                    linkHref="#"
                    value={
                      <Link href="#" underline="hover" sx={{ fontSize: 13, color: '#1976d2' }}>
                        {group?.subscription || '—'}
                      </Link>
                    }
                  />
                  <EssRow label="Subscription ID" value={group?.subscription_id || '—'} />
                  <EssRow
                    label="Tags (edit)"
                    value={<Link href="#" underline="hover" sx={{ fontSize: 13, color: '#1976d2' }}>Add tags</Link>}
                  />
                </Box>

                {/* Right column */}
                <Box>
                  <EssRow label="URL" value={resource?.url || '—'} />
                  <EssRow label="App Environment" value={resource?.os || '—'} />
                  <EssRow label="Operating System" value={resource?.os || '—'} />
                  <EssRow label="Runtime version" value={resource?.runtime_version || '—'} />
                </Box>
              </Box>
            </Collapse>
          </Box>

          <Divider sx={{ borderColor: '#e0e0e0' }} />

          {/* Tabs */}
          <Box sx={{ px: 3, pt: 1 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}
              sx={{ minHeight: 36, '& .MuiTab-root': { textTransform: 'none', minHeight: 36, fontSize: 13.5, py: 0.5 } }}>
              <Tab label="Functions" />
              <Tab label="Metrics" />
              <Tab label="Properties" />
              <Tab label="Notifications (0)" />
            </Tabs>
          </Box>

          <Divider sx={{ borderColor: '#e0e0e0' }} />

          {/* Tab body */}
          {tab === 0 && (
            <Box sx={{ px: 3, py: 2 }}>

              {/* Loading or table */}
              {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
                  <CircularProgress size={40} sx={{ color: '#1976d2' }} />
                  <Typography sx={{ mt: 2, fontSize: 13, color: 'text.secondary' }}>Loading...</Typography>
                </Box>
              ) : functions.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderColor: '#e0e0e0' }}>
                  <BoltOutlinedIcon sx={{ fontSize: 60, color: '#bdbdbd', mb: 1 }} />
                  <Typography sx={{ fontSize: 16, fontWeight: 500, mb: 0.5 }}>
                    No functions yet
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mb: 2 }}>
                    Create your first function to get started.
                  </Typography>
                  <Button variant="contained" color="primary" size="small"
                    startIcon={<AddOutlinedIcon sx={{ fontSize: 16 }} />}
                    onClick={() => setCreateOpen(true)}
                    sx={{ textTransform: 'none', fontWeight: 500 }}>
                    Create function
                  </Button>
                </Paper>
              ) : (
                <>
                  <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 'none', borderColor: '#e0e0e0', overflowX: 'auto' }}>
                    <Table size="small" sx={{ minWidth: 560 }}>
                      <TableHead sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? t.palette.grey[800] : '#fafafa' }}>
                        <TableRow>
                          <TableCell padding="checkbox"><Checkbox size="small" disabled /></TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: 12.5, color: 'text.secondary' }}>Name ↑↓</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: 12.5, color: 'text.secondary' }}>Trigger</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: 12.5, color: 'text.secondary' }}>Language</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: 12.5, color: 'text.secondary' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: 12.5, color: 'text.secondary' }}>Created</TableCell>
                          <TableCell sx={{ width: 52 }} align="center"></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedData.map((row) => (
                          <TableRow key={row.id} hover sx={{ '& .action-icon': { opacity: 0, transition: 'opacity 0.15s' }, '&:hover .action-icon': { opacity: 1 } }}>
                            <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <BoltOutlinedIcon sx={{ fontSize: 18, color: '#ffa500' }} />
                                <Typography
                                  variant="body2"
                                  fontSize={13}
                                  fontWeight={500}
                                  color="primary"
                                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                  onClick={() => navigate(`/recycle-bin/${groupId}/function-app/${resourceId}/function/${row.id}`)}
                                >
                                  {row.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell><Typography variant="body2" fontSize={13} color="text.secondary">{row.trigger}</Typography></TableCell>
                            <TableCell><Typography variant="body2" fontSize={13} color="text.secondary">{row.language}</Typography></TableCell>
                            <TableCell>
                              <Chip label={row.status} size="small"
                                sx={{ height: 22, fontSize: 11, bgcolor: row.status === 'Enabled' ? (t) => t.palette.mode === 'dark' ? 'rgba(46,125,50,0.2)' : '#e8f5e9' : 'action.selected', color: row.status === 'Enabled' ? '#4caf50' : 'text.secondary' }} />
                            </TableCell>
                            <TableCell><Typography variant="body2" fontSize={13} color="text.secondary">{new Date(row.created_at).toLocaleString()}</Typography></TableCell>
                            <TableCell align="center" sx={{ width: 52, py: 0.5 }}>
                              <Tooltip title="Actions" arrow placement="left">
                                <IconButton className="action-icon" size="small"
                                  onClick={(e) => { setMenuAnchor(e.currentTarget); setMenuRow(row); }}
                                  style={{ opacity: menuRow?.id === row.id ? 1 : undefined }}
                                  sx={{ color: '#757575', '&:hover': { color: '#1976d2', bgcolor: '#e3f2fd' } }}>
                                  <MoreHorizIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <PaginationBar
                      page={page}
                      totalPages={totalPages}
                      rowsPerPage={ROWS_PER_PAGE}
                      rowsPerPageOptions={[10]}
                      onPageChange={setPage}
                    />
                    <Button variant="contained" size="small" startIcon={<FeedbackOutlinedIcon sx={{ fontSize: 16 }} />}
                      onClick={() => setFeedbackOpen(true)}
                      sx={{ textTransform: 'none', fontSize: 13, borderRadius: 2, px: 2, boxShadow: '0 2px 8px rgba(25,118,210,0.35)' }}>
                      Feedback
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          )}

          {tab !== 0 && (
            <Box sx={{ p: 4, color: 'text.secondary', fontSize: 13 }}>
              Content for this tab is not yet available.
            </Box>
          )}
          </Box> {/* end Pane 2 */}
        </Box> {/* end pane1+pane2 row */}
      </Box> {/* end outer column */}

      {/* ── Context menu ── */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)}
        onClose={() => { setMenuAnchor(null); setMenuRow(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { minWidth: 150, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', borderRadius: 1 } }}>
        <MenuItem onClick={() => handleDeleteFunction(menuRow)} sx={{ fontSize: 14, gap: 1.5, py: 1, color: '#e53935' }}>
          <DeleteOutlineIcon sx={{ fontSize: 17 }} /> Delete
        </MenuItem>
      </Menu>

      <CreateFunction
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        resourceId={resourceId}
        onCreated={() => { fetchData(); showBanner('Function created successfully.'); }}
      />

      <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </Box>
  );
};

export default FunctionAppDetail;
