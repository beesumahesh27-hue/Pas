import React, { useState, useEffect, useCallback } from 'react';
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
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

import BoltOutlinedIcon              from '@mui/icons-material/BoltOutlined';
import HomeOutlinedIcon              from '@mui/icons-material/HomeOutlined';
import CodeOutlinedIcon              from '@mui/icons-material/CodeOutlined';
import AccountTreeOutlinedIcon       from '@mui/icons-material/AccountTreeOutlined';
import MonitorHeartOutlinedIcon      from '@mui/icons-material/MonitorHeartOutlined';
import VpnKeyOutlinedIcon            from '@mui/icons-material/VpnKeyOutlined';
import CheckCircleOutlineIcon        from '@mui/icons-material/CheckCircleOutline';
import BlockOutlinedIcon             from '@mui/icons-material/BlockOutlined';
import DeleteOutlineIcon             from '@mui/icons-material/DeleteOutline';
import LinkOutlinedIcon              from '@mui/icons-material/LinkOutlined';
import RefreshOutlinedIcon           from '@mui/icons-material/RefreshOutlined';
import SearchOutlinedIcon            from '@mui/icons-material/SearchOutlined';
import PushPinOutlinedIcon           from '@mui/icons-material/PushPinOutlined';
import StarBorderOutlinedIcon        from '@mui/icons-material/StarBorderOutlined';
import MoreHorizIcon                 from '@mui/icons-material/MoreHoriz';
import CloseIcon                     from '@mui/icons-material/Close';
import KeyboardArrowUpIcon           from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon         from '@mui/icons-material/KeyboardArrowDown';
import KeyboardDoubleArrowLeftIcon   from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon  from '@mui/icons-material/KeyboardDoubleArrowRight';
import BarChartOutlinedIcon          from '@mui/icons-material/BarChartOutlined';
import OpenWithOutlinedIcon          from '@mui/icons-material/OpenWithOutlined';
import CheckCircleIcon               from '@mui/icons-material/CheckCircle';
import CancelIcon                    from '@mui/icons-material/Cancel';
import InfoOutlinedIcon              from '@mui/icons-material/InfoOutlined';
import FilterListOutlinedIcon        from '@mui/icons-material/FilterListOutlined';
import QueryStatsOutlinedIcon        from '@mui/icons-material/QueryStatsOutlined';

import api from '../../services/api';

const NAV_SECTIONS = [
  {
    items: [
      { key: 'overview', label: 'Overview', icon: <HomeOutlinedIcon sx={{ fontSize: 20 }} /> },
    ],
  },
  {
    header: 'Developer',
    items: [
      { key: 'code',        label: 'Code + Test',    icon: <CodeOutlinedIcon           sx={{ fontSize: 20 }} /> },
      { key: 'integration', label: 'Integration',    icon: <AccountTreeOutlinedIcon    sx={{ fontSize: 20 }} /> },
      { key: 'monitor',     label: 'Monitor',        icon: <MonitorHeartOutlinedIcon   sx={{ fontSize: 20 }} /> },
      { key: 'keys',        label: 'Function Keys',  icon: <VpnKeyOutlinedIcon         sx={{ fontSize: 20, color: '#fbc02d' }} /> },
    ],
  },
];

const MetricCard = ({ title }) => (
  <Paper variant="outlined" sx={{ flex: 1, p: 2, borderColor: '#e0e0e0', borderRadius: 1.5, minWidth: 220 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary' }}>{title}</Typography>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Pin" arrow>
          <IconButton size="small" sx={{ p: 0.25, color: '#9e9e9e', '&:hover': { color: '#1976d2' } }}>
            <OpenWithOutlinedIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 0.5 }}>
      <BarChartOutlinedIcon sx={{ fontSize: 64, color: '#e0e0e0' }} />
      <Typography sx={{ fontSize: 11, color: '#9e9e9e', mb: 0.5 }}>No data available</Typography>
    </Box>
    <Typography sx={{ fontSize: 11, color: '#bdbdbd' }}>Last 24 hours</Typography>
  </Paper>
);

const EssRow = ({ label, value, move, moveHref }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.25 }}>
      {label}{' '}
      {move && (
        <Link href={moveHref || '#'} underline="hover" sx={{ fontSize: 12, color: '#1976d2' }}>(move)</Link>
      )}
    </Typography>
    <Box sx={{ fontSize: 13, color: 'text.primary' }}>{value ?? <span style={{ color: '#9e9e9e' }}>—</span>}</Box>
  </Box>
);

const INVOCATION_COLUMNS = ['Date (UTC)', 'Success', 'Result Code', 'Duration (ms)', 'Operation Id'];

const MonitorPanel = ({ fnName }) => {
  const [monitorTab, setMonitorTab]       = useState(0);
  const [filterText, setFilterText]       = useState('');
  const [infoDismissed, setInfoDismissed] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tabs */}
      <Box sx={{ px: 3, borderBottom: '1px solid #e0e0e0' }}>
        <Tabs
          value={monitorTab}
          onChange={(_, v) => setMonitorTab(v)}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': { textTransform: 'none', minHeight: 40, fontSize: 13.5, py: 0.5, px: 1.5 },
            '& .MuiTabs-indicator': { bgcolor: '#1976d2' },
          }}
        >
          <Tab label="Invocations" />
          <Tab label="Logs" />
        </Tabs>
      </Box>

      <Box sx={{ px: 3, py: 2, flex: 1, overflowY: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
        {monitorTab === 0 && (
          <>
            {/* Info banner */}
            {!infoDismissed && (
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                px: 2, py: 1.25, mb: 2.5,
                bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(25,118,210,0.12)' : '#e8f0fe',
                border: '1px solid', borderColor: (t) => t.palette.mode === 'dark' ? 'rgba(25,118,210,0.4)' : '#c5d8f8',
                borderRadius: 1,
              }}>
                <InfoOutlinedIcon sx={{ fontSize: 18, color: 'primary.main', flexShrink: 0 }} />
                <Typography sx={{ fontSize: 13, color: 'text.primary', flex: 1 }}>
                  Results may be delayed for up to 5 minutes.
                </Typography>
                <IconButton size="small" onClick={() => setInfoDismissed(true)} sx={{ p: 0.25, color: 'primary.main' }}>
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            )}

            {/* Success / Error counts */}
            <Box sx={{ display: 'flex', gap: 5, mb: 3 }}>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary', mb: 0.75 }}>Success Count</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 20, color: '#2e7d32' }} />
                  <Typography sx={{ fontSize: 20, fontWeight: 600, color: 'text.primary' }}>0</Typography>
                </Box>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Last 30 Days</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary', mb: 0.75 }}>Error Count</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                  <CancelIcon sx={{ fontSize: 20, color: '#c62828' }} />
                  <Typography sx={{ fontSize: 20, fontWeight: 600, color: 'text.primary' }}>0</Typography>
                </Box>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Last 30 Days</Typography>
              </Box>
            </Box>

            {/* Invocation Traces heading */}
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'text.primary', mb: 0.75 }}>
              Invocation Traces
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#6b7280', mb: 1.75, lineHeight: 1.6 }}>
              The twenty most recent function invocation traces. For more advanced analysis, run the query in Application Insights.
            </Typography>

            {/* Action links */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer', '&:hover': { opacity: 0.75 } }}>
                <QueryStatsOutlinedIcon sx={{ fontSize: 17, color: '#1976d2' }} />
                <Typography sx={{ fontSize: 13, color: '#1976d2' }}>Run query in Application Insights</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer', '&:hover': { opacity: 0.75 } }}>
                <RefreshOutlinedIcon sx={{ fontSize: 17, color: '#1976d2' }} />
                <Typography sx={{ fontSize: 13, color: '#1976d2' }}>Refresh</Typography>
              </Box>
            </Box>

            {/* Filter input */}
            <TextField
              size="small"
              placeholder="Filter invocations"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterListOutlinedIcon sx={{ fontSize: 17, color: '#9e9e9e' }} />
                  </InputAdornment>
                ),
                sx: { fontSize: 13, height: 36, borderRadius: 1 },
              }}
              sx={{ mb: 1.5, width: 300 }}
            />

            {/* Table */}
            <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 'none', borderColor: '#e0e0e0' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? t.palette.grey[800] : '#fafafa' }}>
                  <TableRow>
                    {INVOCATION_COLUMNS.map(col => (
                      <TableCell key={col} sx={{ fontWeight: 600, fontSize: 12.5, color: 'text.primary', py: 1 }}>
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5, color: '#9e9e9e', fontSize: 13 }}>
                      No results
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {monitorTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
            <MonitorHeartOutlinedIcon sx={{ fontSize: 48, color: '#bdbdbd', mb: 1.5 }} />
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary', mb: 0.5 }}>No logs available</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              Live streaming logs for this function will appear here.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

const FunctionDetail = () => {
  const navigate = useNavigate();
  const { groupId, resourceId, functionId } = useParams();

  const [fn, setFn]                         = useState(null);
  const [resource, setResource]             = useState(null);
  const [group, setGroup]                   = useState(null);
  const [loading, setLoading]               = useState(true);
  const [activeNav, setActiveNav]           = useState('overview');
  const [navSearch, setNavSearch]           = useState('');
  const [navCollapsed, setNavCollapsed]     = useState(false);
  const [essentialsOpen, setEssentialsOpen] = useState(true);
  const [successMsg, setSuccessMsg]         = useState('');
  const [bannerSeverity, setBannerSeverity] = useState('success');

  const showBanner = (msg, severity = 'success') => {
    setSuccessMsg(msg);
    setBannerSeverity(severity);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: fns }, { data: r }, { data: g }] = await Promise.all([
        api.get(`/recycle-bin/resources/${resourceId}/functions`),
        api.get(`/recycle-bin/resources/${resourceId}`),
        api.get(`/recycle-bin/resource-groups/${groupId}`),
      ]);
      const matched = fns.find(f => String(f.id) === String(functionId));
      setFn(matched || null);
      setResource(r);
      setGroup(g);
      if (!matched) showBanner('Function not found.', 'error');
    } catch (_e) {
      showBanner('Failed to load function details.', 'error');
    } finally {
      setLoading(false);
    }
  }, [functionId, resourceId, groupId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleEnable = async () => {
    try {
      showBanner(`Function "${fn?.name}" enabled.`);
    } catch {
      showBanner('Failed to enable function.', 'error');
    }
  };

  const handleDisable = async () => {
    try {
      showBanner(`Function "${fn?.name}" disabled.`);
    } catch {
      showBanner('Failed to disable function.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete function "${fn?.name}"?`)) return;
    try {
      await api.delete(`/recycle-bin/functions/${functionId}`);
      navigate(`/recycle-bin/${groupId}/function-app/${resourceId}`);
    } catch {
      showBanner('Failed to delete function.', 'error');
    }
  };

  const filteredSections = NAV_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(
      item => !navSearch || item.label.toLowerCase().includes(navSearch.toLowerCase())
    ),
  })).filter(section => section.items.length > 0);

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>

      {/* Alert banner */}
      <Collapse in={Boolean(successMsg)}>
        <Alert severity={bannerSeverity} onClose={() => setSuccessMsg('')}
          sx={{ mx: 3, mt: 1.5, borderRadius: '8px', fontSize: 14, fontWeight: 500 }}>
          {successMsg}
        </Alert>
      </Collapse>

      {/* Breadcrumb */}
      <Box sx={{ px: 3, pt: 2, pb: 1 }}>
        <Breadcrumbs separator=">" sx={{ fontSize: 13 }}>
          <Link
            component="button"
            onClick={() => navigate('/recycle-bin')}
            underline="hover"
            sx={{ fontSize: 13, color: '#1976d2', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', p: 0 }}
          >
            Resource groups
          </Link>
          <Link
            component="button"
            onClick={() => navigate(`/recycle-bin/${groupId}`)}
            underline="hover"
            sx={{ fontSize: 13, color: '#1976d2', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', p: 0 }}
          >
            {group?.name || '...'}
          </Link>
          <Link
            component="button"
            onClick={() => navigate(`/recycle-bin/${groupId}/function-app/${resourceId}`)}
            underline="hover"
            sx={{ fontSize: 13, color: '#1976d2', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', p: 0 }}
          >
            {resource?.name || '...'}
          </Link>
          <Typography sx={{ fontSize: 13, color: 'text.primary' }}>
            {fn?.name || '...'}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

        {/* Title row */}
        <Box sx={{ height: 64, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1.5, px: 2, boxSizing: 'border-box' }}>
          <BoltOutlinedIcon sx={{ fontSize: 40, color: '#ffa500', flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
                {fn?.name || (loading ? '...' : 'Function')}
              </Typography>
              <IconButton size="small" sx={{ color: '#757575', p: 0.25, '&:hover': { color: '#1976d2' } }}>
                <PushPinOutlinedIcon sx={{ fontSize: 14 }} />
              </IconButton>
              <IconButton size="small" sx={{ color: '#757575', p: 0.25, '&:hover': { color: '#fb8c00' } }}>
                <StarBorderOutlinedIcon sx={{ fontSize: 14 }} />
              </IconButton>
              <IconButton size="small" sx={{ color: '#757575', p: 0.25 }}>
                <MoreHorizIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.2 }}>Function</Typography>
          </Box>
          <Tooltip title="Close" arrow>
            <IconButton size="small"
              onClick={() => navigate(`/recycle-bin/${groupId}/function-app/${resourceId}`)}
              sx={{ color: '#757575', '&:hover': { color: '#fff', bgcolor: '#e53935' }, flexShrink: 0 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Pane 1 + Pane 2 */}
        <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>

          {/* ═══ Pane 1: Nav rail ═══ */}
          <Box sx={{ width: navCollapsed ? 44 : 240, flexShrink: 0, display: 'flex', flexDirection: 'column', transition: 'width 0.15s ease', bgcolor: (t) => t.palette.mode === 'dark' ? t.palette.grey[900] : '#f8f9fa' }}>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.25, height: 44, borderBottom: '1px solid #e0e0e0', flexShrink: 0, boxSizing: 'border-box' }}>
              {!navCollapsed && (
                <TextField
                  placeholder="Search"
                  size="small"
                  fullWidth
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlinedIcon sx={{ color: '#9e9e9e', fontSize: 16 }} />
                      </InputAdornment>
                    ),
                    sx: { fontSize: 12, borderRadius: 1, height: 30 },
                  }}
                />
              )}
              <Tooltip title={navCollapsed ? 'Expand' : 'Collapse'} arrow>
                <IconButton size="small" onClick={() => setNavCollapsed(c => !c)} sx={{ p: 0.5, flexShrink: 0 }}>
                  {navCollapsed
                    ? <KeyboardDoubleArrowRightIcon fontSize="small" />
                    : <KeyboardDoubleArrowLeftIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>

            {!navCollapsed && (
              <Box sx={{
                flex: 1, overflowY: 'auto', pb: 1,
                borderRight: '1px solid', borderColor: 'divider',
              }}>
                {filteredSections.map((section, sIdx) => (
                  <Box key={sIdx} sx={{ mb: 0.5 }}>
                    {section.header && (
                      <>
                        <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary', px: 2, pt: 1.5, pb: 0.5, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                          {section.header}
                        </Typography>
                        <Divider sx={{ borderColor: '#e0e0e0' }} />
                      </>
                    )}
                    {section.items.map((item) => {
                      const isActive = activeNav === item.key;
                      return (
                        <Box key={item.key}
                          onClick={() => setActiveNav(item.key)}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: 1.25, px: 2, py: 0.875,
                            cursor: 'pointer',
                            borderLeft: isActive ? '3px solid #1976d2' : '3px solid transparent',
                            bgcolor: isActive ? (t) => t.palette.mode === 'dark' ? 'rgba(25,118,210,0.15)' : '#e3f2fd' : 'transparent',
                            color: isActive ? 'primary.main' : 'text.primary',
                            '&:hover': { bgcolor: isActive ? (t) => t.palette.mode === 'dark' ? 'rgba(25,118,210,0.15)' : '#e3f2fd' : 'action.hover' },
                          }}
                        >
                          <Box sx={{ display: 'flex', color: 'inherit' }}>{item.icon}</Box>
                          <Typography sx={{ fontSize: 12.5, fontWeight: isActive ? 500 : 400, color: 'inherit' }}>
                            {item.label}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            )}

            {navCollapsed && (
              <Box sx={{ flex: 1, overflowY: 'auto', py: 1, borderRight: '1px solid', borderColor: 'divider' }}>
                {NAV_SECTIONS.flatMap(s => s.items).map(item => {
                  const isActive = activeNav === item.key;
                  return (
                    <Tooltip key={item.key} title={item.label} placement="right" arrow>
                      <Box onClick={() => setActiveNav(item.key)}
                        sx={{
                          display: 'flex', justifyContent: 'center', alignItems: 'center',
                          py: 1, cursor: 'pointer',
                          borderLeft: isActive ? '3px solid #1976d2' : '3px solid transparent',
                          bgcolor: isActive ? (t) => t.palette.mode === 'dark' ? 'rgba(25,118,210,0.15)' : '#e3f2fd' : 'transparent',
                          color: isActive ? 'primary.main' : 'text.secondary',
                          '&:hover': { bgcolor: isActive ? (t) => t.palette.mode === 'dark' ? 'rgba(25,118,210,0.15)' : '#e3f2fd' : 'action.hover' },
                        }}>
                        {item.icon}
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* ═══ Pane 2: Content ═══ */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>

            {/* Toolbar */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 0.25, pl: 1, pr: 2,
              height: 44, flexShrink: 0, borderBottom: '1px solid #e0e0e0',
              overflowX: 'auto', boxSizing: 'border-box',
              scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
            }}>
              <Button variant="text" startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
                onClick={handleEnable}
                sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 13, fontWeight: 400, minWidth: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>
                Enable
              </Button>
              <Button variant="text" startIcon={<BlockOutlinedIcon sx={{ fontSize: 16 }} />}
                onClick={handleDisable}
                sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 13, fontWeight: 400, minWidth: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>
                Disable
              </Button>
              <Button variant="text" startIcon={<DeleteOutlineIcon sx={{ fontSize: 16 }} />}
                onClick={handleDelete}
                sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 13, fontWeight: 400, minWidth: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>
                Delete
              </Button>
              <Button variant="text" startIcon={<LinkOutlinedIcon sx={{ fontSize: 16 }} />}
                sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 13, fontWeight: 400, minWidth: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>
                Get Function Url
              </Button>
              <Button variant="text" startIcon={<RefreshOutlinedIcon sx={{ fontSize: 16 }} />}
                onClick={fetchData}
                sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 13, fontWeight: 400, minWidth: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>
                Refresh
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10 }}>
                <CircularProgress size={36} sx={{ color: '#1976d2' }} />
                <Typography sx={{ mt: 2, fontSize: 13, color: 'text.secondary' }}>Loading...</Typography>
              </Box>
            ) : activeNav === 'monitor' ? (
              <MonitorPanel fnName={fn?.name} />
            ) : (
              <>
                {/* Essentials */}
                <Box sx={{ px: 3, py: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <IconButton size="small" onClick={() => setEssentialsOpen(o => !o)} sx={{ p: 0.25, color: 'text.secondary' }}>
                      {essentialsOpen ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                    </IconButton>
                    <Typography
                      sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary', cursor: 'pointer' }}
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
                          move
                          moveHref={`/recycle-bin/${groupId}`}
                          value={
                            <Link href={`/recycle-bin/${groupId}`} underline="hover" sx={{ fontSize: 13, color: '#1976d2' }}>
                              {group?.name || '—'}
                            </Link>
                          }
                        />
                        <EssRow
                          label="Application Insights"
                          value={
                            <Link href="#" underline="hover" sx={{ fontSize: 13, color: '#1976d2' }}>
                              {resource?.name ? `${resource.name}-insights` : '—'}
                            </Link>
                          }
                        />
                        <EssRow label="Location" value={resource?.location || '—'} />
                        <EssRow
                          label="Subscription"
                          move
                          value={
                            <Link href="#" underline="hover" sx={{ fontSize: 13, color: '#1976d2' }}>
                              {group?.subscription || '—'}
                            </Link>
                          }
                        />
                        <EssRow label="Subscription ID" value={<Typography sx={{ fontSize: 13, color: 'text.primary', wordBreak: 'break-all' }}>fe4a1fdb-6a1c-4a6d-a6b0-dbb12f6a00f8</Typography>} />
                      </Box>

                      {/* Right column */}
                      <Box>
                        <EssRow
                          label="Function app"
                          value={
                            <Link href={`/recycle-bin/${groupId}/function-app/${resourceId}`} underline="hover" sx={{ fontSize: 13, color: '#1976d2' }}>
                              {resource?.name || '—'}
                            </Link>
                          }
                        />
                        <EssRow
                          label="Tags (edit)"
                          value={<Link href="#" underline="hover" sx={{ fontSize: 13, color: '#1976d2' }}>Add tags</Link>}
                        />
                        <EssRow
                          label="Status"
                          value={
                            <Chip
                              label={fn?.status || 'Enabled'}
                              size="small"
                              sx={{
                                height: 22, fontSize: 11,
                                bgcolor: fn?.status === 'Disabled' ? 'action.selected' : (t) => t.palette.mode === 'dark' ? 'rgba(46,125,50,0.2)' : '#e8f5e9',
                                color:  fn?.status === 'Disabled' ? 'text.secondary' : '#4caf50',
                              }}
                            />
                          }
                        />
                        <EssRow label="Trigger" value={fn?.trigger || '—'} />
                        <EssRow label="Language" value={fn?.language || '—'} />
                      </Box>
                    </Box>

                    {fn?.description && (
                      <Box sx={{ mb: 1 }}>
                        <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.25 }}>Description</Typography>
                        <Typography sx={{ fontSize: 13, color: 'text.primary' }}>{fn.description}</Typography>
                      </Box>
                    )}

                    <Link href="#" underline="hover" sx={{ fontSize: 13, color: '#1976d2', display: 'inline-block', mb: 1 }}>
                      See more
                    </Link>
                  </Collapse>
                </Box>

                <Divider sx={{ borderColor: '#e0e0e0' }} />

                {/* Overview content */}
                {activeNav === 'overview' && (
                  <Box sx={{ px: 3, py: 2 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary', mb: 2 }}>
                      Execution metrics — last 24 hours
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <MetricCard title="Total Execution Count" />
                      <MetricCard title="Successful Execution Count" />
                    </Box>
                  </Box>
                )}

                {activeNav === 'code' && (
                  <Box sx={{ px: 3, py: 3 }}>
                    <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderColor: '#e0e0e0', borderRadius: 1.5 }}>
                      <CodeOutlinedIcon sx={{ fontSize: 48, color: '#bdbdbd', mb: 1 }} />
                      <Typography sx={{ fontSize: 15, fontWeight: 500, mb: 0.5 }}>Code + Test</Typography>
                      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                        Online code editor and test runner for this function.
                      </Typography>
                    </Paper>
                  </Box>
                )}

                {activeNav === 'integration' && (
                  <Box sx={{ px: 3, py: 3 }}>
                    <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderColor: '#e0e0e0', borderRadius: 1.5 }}>
                      <AccountTreeOutlinedIcon sx={{ fontSize: 48, color: '#bdbdbd', mb: 1 }} />
                      <Typography sx={{ fontSize: 15, fontWeight: 500, mb: 0.5 }}>Integration</Typography>
                      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                        Configure triggers, inputs, and output bindings.
                      </Typography>
                    </Paper>
                  </Box>
                )}


                {activeNav === 'keys' && (
                  <Box sx={{ px: 3, py: 3 }}>
                    <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderColor: '#e0e0e0', borderRadius: 1.5 }}>
                      <VpnKeyOutlinedIcon sx={{ fontSize: 48, color: '#fbc02d', mb: 1 }} />
                      <Typography sx={{ fontSize: 15, fontWeight: 500, mb: 0.5 }}>Function Keys</Typography>
                      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                        Manage access keys for this function.
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default FunctionDetail;
