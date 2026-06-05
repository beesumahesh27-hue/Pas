import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Checkbox,
  Chip,
  Collapse,
  FormControl,
  IconButton,
  InputAdornment,
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
  TableRow,
  Tabs,
  Tab,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import AddOutlinedIcon              from '@mui/icons-material/AddOutlined';
import RefreshOutlinedIcon          from '@mui/icons-material/RefreshOutlined';
import SearchOutlinedIcon           from '@mui/icons-material/SearchOutlined';
import FileDownloadOutlinedIcon     from '@mui/icons-material/FileDownloadOutlined';
import DeleteOutlineIcon            from '@mui/icons-material/DeleteOutline';
import MoreHorizIcon                from '@mui/icons-material/MoreHoriz';
import FolderOutlinedIcon           from '@mui/icons-material/FolderOutlined';
import FilterAltOutlinedIcon        from '@mui/icons-material/FilterAltOutlined';
import InsightsOutlinedIcon         from '@mui/icons-material/InsightsOutlined';
import BoltOutlinedIcon             from '@mui/icons-material/BoltOutlined';
import StorageOutlinedIcon          from '@mui/icons-material/StorageOutlined';
import LayersOutlinedIcon           from '@mui/icons-material/LayersOutlined';
import FeedbackOutlinedIcon         from '@mui/icons-material/FeedbackOutlined';
import HomeOutlinedIcon             from '@mui/icons-material/HomeOutlined';
import ListAltOutlinedIcon          from '@mui/icons-material/ListAltOutlined';
import VpnKeyOutlinedIcon           from '@mui/icons-material/VpnKeyOutlined';
import LabelOutlinedIcon            from '@mui/icons-material/LabelOutlined';
import AccountTreeOutlinedIcon      from '@mui/icons-material/AccountTreeOutlined';
import EventNoteOutlinedIcon        from '@mui/icons-material/EventNoteOutlined';
import RocketLaunchOutlinedIcon     from '@mui/icons-material/RocketLaunchOutlined';
import SecurityOutlinedIcon         from '@mui/icons-material/SecurityOutlined';
import InventoryOutlinedIcon        from '@mui/icons-material/InventoryOutlined';
import PolicyOutlinedIcon           from '@mui/icons-material/PolicyOutlined';
import DescriptionOutlinedIcon      from '@mui/icons-material/DescriptionOutlined';
import LockOutlinedIcon             from '@mui/icons-material/LockOutlined';
import PaidOutlinedIcon             from '@mui/icons-material/PaidOutlined';
import KeyboardDoubleArrowLeftIcon  from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import PushPinOutlinedIcon          from '@mui/icons-material/PushPinOutlined';
import StarBorderOutlinedIcon       from '@mui/icons-material/StarBorderOutlined';
import CloseIcon                    from '@mui/icons-material/Close';
import ExpandMoreOutlinedIcon       from '@mui/icons-material/ExpandMoreOutlined';
import ViewListOutlinedIcon         from '@mui/icons-material/ViewListOutlined';
import InfoOutlinedIcon             from '@mui/icons-material/InfoOutlined';

import api from '../../services/api';
import PaginationBar from '../../components/PaginationBar';
import CreateResource from './RecycleBinActions/CreateResource';
import FeedbackDialog from '../PasOverview/Tasks/FeedbackDialog';


const resourceIcon = (type) => {
  if (type === 'Application Insights') return <InsightsOutlinedIcon sx={{ fontSize: 18, color: '#a64aff' }} />;
  if (type === 'Function App')         return <BoltOutlinedIcon     sx={{ fontSize: 18, color: '#ffa500' }} />;
  if (type === 'Storage account')      return <StorageOutlinedIcon  sx={{ fontSize: 18, color: '#3b9c4e' }} />;
  return <LayersOutlinedIcon sx={{ fontSize: 18, color: '#1976d2' }} />;
};

const NAV_SECTIONS = [
  {
    items: [
      { key: 'overview',  label: 'Overview',             icon: <HomeOutlinedIcon         sx={{ fontSize: 18 }} /> },
      { key: 'activity',  label: 'Activity log',         icon: <ListAltOutlinedIcon      sx={{ fontSize: 18 }} /> },
      { key: 'iam',       label: 'Access control (IAM)', icon: <VpnKeyOutlinedIcon       sx={{ fontSize: 18 }} /> },
      { key: 'tags',      label: 'Tags',                 icon: <LabelOutlinedIcon        sx={{ fontSize: 18 }} /> },
      { key: 'visualizer',label: 'Resource visualizer',  icon: <AccountTreeOutlinedIcon  sx={{ fontSize: 18 }} /> },
      { key: 'events',    label: 'Events',               icon: <EventNoteOutlinedIcon    sx={{ fontSize: 18 }} /> },
    ],
  },
  {
    header: 'Settings',
    items: [
      { key: 'deployments',   label: 'Deployments',       icon: <RocketLaunchOutlinedIcon sx={{ fontSize: 18 }} /> },
      { key: 'security',      label: 'Security',          icon: <SecurityOutlinedIcon     sx={{ fontSize: 18 }} /> },
      { key: 'stacks',        label: 'Deployment stacks', icon: <InventoryOutlinedIcon    sx={{ fontSize: 18 }} /> },
      { key: 'policies',      label: 'Policies',          icon: <PolicyOutlinedIcon       sx={{ fontSize: 18 }} /> },
      { key: 'properties',    label: 'Properties',        icon: <DescriptionOutlinedIcon  sx={{ fontSize: 18 }} /> },
      { key: 'locks',         label: 'Locks',             icon: <LockOutlinedIcon         sx={{ fontSize: 18 }} /> },
    ],
  },
];

/* Pane 1 style — distinct background only; border lives on the inner scrollable list */
const paneShadowRight = (t) => ({
  bgcolor: t.palette.mode === 'dark' ? t.palette.grey[900] : '#f8f9fa',
});

const PAGE_SIZE_OPTIONS = [10, 20, 100];

/* Compact Azure-style pagination shared by pane 1 and pane 3 */


const ResourceGroupDetail = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const authUser  = useSelector((s) => s.auth.user);

  const [group, setGroup]                 = useState(null);
  const [resources, setResources]         = useState([]);
  const [allGroups, setAllGroups]         = useState([]);
  const [loading, setLoading]             = useState(false);
  const [page, setPage]                   = useState(1);
  const [groupsPage, setGroupsPage]       = useState(1);
  const [rowsPerPage, setRowsPerPage]     = useState(10);
  const [groupsRowsPerPage, setGroupsRowsPerPage] = useState(10);
  const [searchInput, setSearchInput]     = useState('');
  const [navSearch, setNavSearch]         = useState('');
  const [groupsSearch, setGroupsSearch]   = useState('');
  const [activeNav, setActiveNav]         = useState('overview');
  const [tab, setTab]                     = useState(0);
  const [menuAnchor, setMenuAnchor]       = useState(null);
  const [menuRow, setMenuRow]             = useState(null);
  const [createOpen, setCreateOpen]       = useState(false);
  const [groupsCollapsed, setGroupsCollapsed]   = useState(false);
  const [subNavCollapsed, setSubNavCollapsed]   = useState(false);
  const [grouping, setGrouping]           = useState('No grouping');
  const [viewMode, setViewMode]           = useState('List view');
  const [successMsg, setSuccessMsg]         = useState('');
  const [bannerSeverity, setBannerSeverity] = useState('success');
  const [feedbackOpen, setFeedbackOpen]     = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: g }, { data: rs }, { data: groups }] = await Promise.all([
        api.get(`/recycle-bin/resource-groups/${groupId}`),
        api.get(`/recycle-bin/resource-groups/${groupId}/resources`),
        api.get('/recycle-bin/resource-groups'),
      ]);
      setGroup(g);
      setResources(rs);
      setAllGroups(groups);
    } catch (_e) { /* ignore */ } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showBanner = (msg, severity = 'success') => {
    setSuccessMsg(msg);
    setBannerSeverity(severity);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const filtered = resources.filter(r =>
    !searchInput || r.name.toLowerCase().includes(searchInput.toLowerCase()) || r.type.toLowerCase().includes(searchInput.toLowerCase())
  );
  const totalPages    = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginatedData = filtered.slice((page - 1) * rowsPerPage, (page - 1) * rowsPerPage + rowsPerPage);

  const filteredGroups = allGroups.filter(g =>
    !groupsSearch || g.name.toLowerCase().includes(groupsSearch.toLowerCase())
  );
  const groupsTotalPages = Math.max(1, Math.ceil(filteredGroups.length / groupsRowsPerPage));
  const paginatedGroups  = filteredGroups.slice((groupsPage - 1) * groupsRowsPerPage, (groupsPage - 1) * groupsRowsPerPage + groupsRowsPerPage);

  const handleDeleteResource = async (row) => {
    setMenuAnchor(null);
    setMenuRow(null);
    if (!window.confirm(`Delete resource "${row.name}"?`)) return;
    try {
      await api.delete(`/recycle-bin/resources/${row.id}`);
      fetchData();
      showBanner(`Resource "${row.name}" deleted.`);
    } catch {
      showBanner('Failed to delete resource.', 'error');
    }
  };

  const handleResourceClick = (row) => {
    if (row.type === 'Function App') {
      navigate(`/recycle-bin/${groupId}/function-app/${row.id}`);
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm(`Delete resource group "${group?.name}" and all its resources?`)) return;
    try {
      await api.delete(`/recycle-bin/resource-groups/${groupId}`);
      navigate('/recycle-bin');
    } catch {
      showBanner('Failed to delete resource group.', 'error');
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      <Collapse in={Boolean(successMsg)}>
        <Alert severity={bannerSeverity} onClose={() => setSuccessMsg('')}
          sx={{ mx: 3, mt: 1.5, borderRadius: '8px', fontSize: 14, fontWeight: 500 }}>
          {successMsg}
        </Alert>
      </Collapse>

      {/* ── Top breadcrumb bar ── */}
      <Box sx={{ px: 3, pt: 2, pb: 1, bgcolor: 'background.paper' }}>
        <Breadcrumbs separator="›" sx={{ fontSize: 13 }}>
          <Link component="button" onClick={() => navigate('/dashboard')} underline="hover" sx={{ fontSize: 13, color: '#1976d2', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', p: 0 }}>Home</Link>
          <Link component="button" onClick={() => navigate('/recycle-bin')} underline="hover" sx={{ fontSize: 13, color: '#1976d2', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', p: 0 }}>Resource groups</Link>
          <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>{group?.name || '...'}</Typography>
        </Breadcrumbs>
      </Box>

      {/* ── 3-pane layout ── */}
      <Box sx={{ flex: 1, display: 'flex', minHeight: 0, bgcolor: 'background.default' }}>

        {/* ═════ Pane 1: Resource groups list ═════ */}
        <Box sx={(t) => ({
          width: groupsCollapsed ? 44 : { xs: 200, sm: 240, md: 270 },
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.15s ease',
          ...paneShadowRight(t),
        })}>
          {/* Header — fixed 64px, NO border (line lives below toolbar) */}
          <Box sx={{ px: 2, height: 64, display: 'flex', alignItems: 'flex-start', pt: 1, gap: 1, boxSizing: 'border-box' }}>
            {!groupsCollapsed && (
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 22, fontWeight: 700, color: 'text.primary', lineHeight: 1.1 }}>
                  Resource groups
                </Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', mt: 0.25 }}>
                  {authUser?.email || authUser?.name || 'Default Directory'}
                </Typography>
              </Box>
            )}
            <Tooltip title={groupsCollapsed ? 'Expand' : 'Collapse'} arrow>
              <IconButton size="small" onClick={() => setGroupsCollapsed(c => !c)} sx={{ flexShrink: 0, mt: -0.5 }}>
                {groupsCollapsed ? <KeyboardDoubleArrowRightIcon fontSize="small" /> : <KeyboardDoubleArrowLeftIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>

          {!groupsCollapsed && (
            <>
              {/* Toolbar — fixed 44px with the shared horizontal line below */}
              <Box sx={{
                display: 'flex',
                gap: 0.5,
                px: 1,
                height: 44,
                alignItems: 'center',
                borderBottom: '1px solid', borderColor: 'divider',
                boxSizing: 'border-box',
              }}>
                <Button size="small" startIcon={<AddOutlinedIcon sx={{ fontSize: 15 }} />}
                  onClick={() => navigate('/recycle-bin')}
                  sx={{ textTransform: 'none', fontSize: 12, color: '#1976d2', minWidth: 0, px: 1 }}>
                  Create
                </Button>
                <Button size="small" endIcon={<ExpandMoreOutlinedIcon sx={{ fontSize: 14 }} />}
                  sx={{ textTransform: 'none', fontSize: 12, color: 'text.secondary', minWidth: 0, px: 1 }}>
                  Manage view
                </Button>
              </Box>

              {/* Search */}
              <Box sx={{ px: 1, py: 1 }}>
                <TextField
                  placeholder="Filter for any field..."
                  size="small"
                  fullWidth
                  value={groupsSearch}
                  onChange={(e) => { setGroupsSearch(e.target.value); setGroupsPage(1); }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlinedIcon sx={{ color: '#9e9e9e', fontSize: 16 }} />
                      </InputAdornment>
                    ),
                    sx: { fontSize: 12, borderRadius: 1 },
                  }}
                />
              </Box>

              {/* Name header */}
              <Box sx={{ px: 2, py: 0.75 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>Name ↑↓</Typography>
              </Box>

              {/* Groups list */}
              <Box sx={{ flex: 1, overflowY: 'auto', borderRight: '1px solid', borderColor: 'divider' }}>
                {paginatedGroups.map((g) => {
                  const isActive = String(g.id) === String(groupId);
                  return (
                    <Box
                      key={g.id}
                      onClick={() => navigate(`/recycle-bin/${g.id}`)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 1,
                        cursor: 'pointer',
                        bgcolor: isActive ? 'action.selected' : 'transparent',
                        '&:hover': { bgcolor: isActive ? 'action.selected' : 'action.hover' },
                      }}
                    >
                      <FolderOutlinedIcon sx={{ fontSize: 16, color: '#0078d4' }} />
                      <Typography
                        sx={{
                          fontSize: 13,
                          color: '#1976d2',
                          flex: 1,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {g.name}
                      </Typography>
                      <IconButton size="small" sx={{ p: 0.25 }}>
                        <MoreHorizIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      </IconButton>
                    </Box>
                  );
                })}
              </Box>

              {/* Bottom pagination */}
              <Box sx={{ borderTop: '1px solid', borderColor: 'divider', px: 1.5, py: 0.75 }}>
                <PaginationBar
                  compact
                  page={groupsPage}
                  totalPages={groupsTotalPages}
                  rowsPerPage={groupsRowsPerPage}
                  rowsPerPageOptions={PAGE_SIZE_OPTIONS}
                  onPageChange={setGroupsPage}
                  onRowsPerPageChange={(n) => { setGroupsRowsPerPage(n); setGroupsPage(1); }}
                />
              </Box>
            </>
          )}
        </Box>

        {/* ═════ Pane 2 + Pane 3: right column (title spans both) ═════ */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, bgcolor: 'background.paper' }}>

          {/* ── FULL-WIDTH title row spanning pane 2 → pane 3 ── */}
          <Box sx={{ height: 64, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1.5, px: 2, boxSizing: 'border-box' }}>
            <FolderOutlinedIcon sx={{ fontSize: 42, color: '#1976d2', flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
                  {group?.name || 'Resource group'}
                </Typography>
                <IconButton size="small" sx={{ color: 'text.secondary', p: 0.25, '&:hover': { color: '#1976d2' } }}><PushPinOutlinedIcon sx={{ fontSize: 15 }} /></IconButton>
                <IconButton size="small" sx={{ color: 'text.secondary', p: 0.25, '&:hover': { color: '#fb8c00' } }}><StarBorderOutlinedIcon sx={{ fontSize: 15 }} /></IconButton>
                <IconButton size="small" sx={{ color: 'text.secondary', p: 0.25 }}><MoreHorizIcon sx={{ fontSize: 15 }} /></IconButton>
              </Box>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.2 }}>Resource group</Typography>
            </Box>
            <Tooltip title="Close" arrow>
              <IconButton size="small" onClick={() => navigate('/recycle-bin')}
                sx={{ color: 'text.secondary', transition: 'all 0.15s', '&:hover': { color: '#fff', bgcolor: '#e53935' }, flexShrink: 0 }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* ── Pane 2 + Pane 3 side-by-side row ── */}
          <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>

            {/* ── Pane 2: Sub-navigation rail ── */}
            <Box sx={(t) => ({ width: subNavCollapsed ? 44 : { xs: 170, sm: 200, md: 230 }, flexShrink: 0, bgcolor: t.palette.mode === 'dark' ? t.palette.grey[900] : '#f8f9fa', display: 'flex', flexDirection: 'column', transition: 'width 0.15s ease' })}>

              {/* Search + collapse arrow — fixed 44px with the shared horizontal line below */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.25, height: 44, boxSizing: 'border-box', borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
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
                            <Box key={item.key} onClick={() => setActiveNav(item.key)}
                              sx={{
                                display: 'flex', alignItems: 'center', gap: 1.25, px: 2, py: 0.875, cursor: 'pointer',
                                borderLeft: isActive ? '3px solid #1976d2' : '3px solid transparent',
                                bgcolor: isActive ? (t) => t.palette.mode === 'dark' ? 'rgba(25,118,210,0.15)' : '#e3f2fd' : 'transparent',
                                color: isActive ? 'primary.main' : 'text.primary',
                                '&:hover': { bgcolor: isActive ? (t) => t.palette.mode === 'dark' ? 'rgba(25,118,210,0.15)' : '#e3f2fd' : (t) => t.palette.mode === 'dark' ? t.palette.grey[800] : '#f5f5f5' },
                              }}
                            >
                              <Box sx={{ color: isActive ? 'primary.main' : 'text.secondary', display: 'flex' }}>{item.icon}</Box>
                              <Typography sx={{ fontSize: 12.5, fontWeight: isActive ? 500 : 400, color: 'inherit' }}>{item.label}</Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    );
                  })}
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary', px: 2, pt: 1.5, pb: 0.5 }}>Cost Management</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2, py: 0.875, color: 'text.primary', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                    <PaidOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography sx={{ fontSize: 12.5 }}>Cost analysis</Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* ── Pane 3: Content ── */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              {/* Action toolbar */}
              <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'center', flexWrap: 'nowrap', px: 1, height: 44, flexShrink: 0, borderBottom: '1px solid', borderColor: 'divider', boxSizing: 'border-box', overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                <Button variant="text" startIcon={<AddOutlinedIcon sx={{ fontSize: 17 }} />} onClick={() => setCreateOpen(true)} sx={{ textTransform: 'none', color: '#1976d2', fontSize: 13.5, fontWeight: 400, minWidth: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>Create</Button>
                <Button variant="text" endIcon={<ExpandMoreOutlinedIcon sx={{ fontSize: 15 }} />} sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 13.5, fontWeight: 400, minWidth: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>Manage view</Button>
                <Button variant="text" startIcon={<DeleteOutlineIcon sx={{ fontSize: 17 }} />} onClick={handleDeleteGroup} sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 13.5, fontWeight: 400, minWidth: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>Delete resource group</Button>
                <Button variant="text" startIcon={<RefreshOutlinedIcon sx={{ fontSize: 17 }} />} onClick={fetchData} sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 13.5, fontWeight: 400, minWidth: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>Refresh</Button>
                <Button variant="text" startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 17 }} />} sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 13.5, fontWeight: 400, minWidth: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>Export to CSV</Button>
                <IconButton size="small" sx={{ flexShrink: 0, ml: 0.5 }}><MoreHorizIcon fontSize="small" /></IconButton>
              </Box>

              {/* Tabs */}
              <Box sx={{ px: 2.5 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ minHeight: 36, '& .MuiTab-root': { textTransform: 'none', minHeight: 36, fontSize: 13.5, py: 0.5 } }}>
                  <Tab label="Resources" />
                  <Tab label="Recommendations" />
                </Tabs>
              </Box>

              {/* Filters row */}
              <Box sx={{ px: 2.5, pt: 1.25, pb: 0.75, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <TextField placeholder="Filter for any field..." size="small" value={searchInput}
                  onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlinedIcon sx={{ color: '#9e9e9e', fontSize: 17 }} /></InputAdornment>, sx: { fontSize: 13, borderRadius: 1, height: 32 } }}
                  sx={{ width: 180, flexShrink: 0 }}
                />
                <Chip label="Type equals all" onDelete={() => {}} size="small" variant="outlined" sx={{ fontSize: 12, height: 30, borderRadius: 1, bgcolor: 'background.paper', flexShrink: 0 }} />
                <Button variant="text" startIcon={<FilterAltOutlinedIcon sx={{ fontSize: 16 }} />} sx={{ textTransform: 'none', color: '#1976d2', fontSize: 13, fontWeight: 400, minWidth: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>Add filter</Button>
                <Box sx={{ flex: 1, minWidth: 8 }} />
                <Button variant="text" endIcon={<ExpandMoreOutlinedIcon sx={{ fontSize: 16 }} />} sx={{ textTransform: 'none', color: '#1976d2', fontSize: 13, fontWeight: 400, minWidth: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>More (1)</Button>
              </Box>

              {/* Row count + Show hidden + grouping */}
              <Box sx={{ px: 2.5, pb: 0.75, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', rowGap: 0.75 }}>
                <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
                  Showing {filtered.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filtered.length)} of {filtered.length} records.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Checkbox size="small" sx={{ p: 0.25 }} />
                  <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Show hidden types</Typography>
                  <InfoOutlinedIcon sx={{ fontSize: 14, color: '#9e9e9e' }} />
                </Box>
                <Box sx={{ flex: 1 }} />
                <FormControl size="small">
                  <Select value={grouping} onChange={(e) => setGrouping(e.target.value)} IconComponent={ExpandMoreOutlinedIcon}
                    sx={{ fontSize: 12.5, height: 30, minWidth: 160, bgcolor: 'background.paper', '& fieldset': { borderColor: '#d0d0d0' } }}>
                    <MenuItem value="No grouping" sx={{ fontSize: 12.5 }}>No grouping</MenuItem>
                    <MenuItem value="Group by type" sx={{ fontSize: 12.5 }}>Group by type</MenuItem>
                    <MenuItem value="Group by location" sx={{ fontSize: 12.5 }}>Group by location</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* List-view selector */}
              <Box sx={{ px: 2.5, pb: 1 }}>
                <FormControl size="small">
                  <Select value={viewMode} onChange={(e) => setViewMode(e.target.value)} IconComponent={ExpandMoreOutlinedIcon}
                    renderValue={(v) => <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><ViewListOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} /><Typography sx={{ fontSize: 12.5 }}>{v}</Typography></Box>}
                    sx={{ fontSize: 12.5, height: 28, minWidth: 130, bgcolor: 'background.paper', '& fieldset': { borderColor: '#d0d0d0' } }}>
                    <MenuItem value="List view" sx={{ fontSize: 12.5 }}>List view</MenuItem>
                    <MenuItem value="Card view" sx={{ fontSize: 12.5 }}>Card view</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Resources table */}
              <Box sx={{ flex: 1, px: 2.5, pb: 1, overflowY: 'auto', '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#bdbdbd', borderRadius: 3 } }}>
                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: 'none', overflowX: 'auto', '& .MuiTableCell-root': { borderRight: 'none', borderLeft: 'none', borderTop: 'none' } }}>
                  <Table size="small" sx={{ minWidth: 480 }}>
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                      <TableRow>
                        <TableCell padding="checkbox" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}><Checkbox size="small" disabled /></TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 12.5, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' }}>Name ↑↓</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 12.5, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' }}>Type ↑↓</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 12.5, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' }}>Location ↑↓</TableCell>
                        <TableCell sx={{ width: 52, borderBottom: '1px solid', borderColor: 'divider' }} align="center" />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedData.length > 0 ? paginatedData.map((row) => (
                        <TableRow key={row.id} hover sx={{ '& .action-icon': { opacity: 0, transition: 'opacity 0.15s' }, '&:hover .action-icon': { opacity: 1 } }}>
                          <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {resourceIcon(row.type)}
                              <Typography variant="body2" fontSize={13} color="primary"
                                sx={{ cursor: row.type === 'Function App' ? 'pointer' : 'default', textDecoration: row.type === 'Function App' ? 'underline' : 'none', '&:hover': row.type === 'Function App' ? { color: '#0d47a1' } : {} }}
                                onClick={() => handleResourceClick(row)}>
                                {row.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell><Typography variant="body2" fontSize={13} color="text.secondary">{row.type}</Typography></TableCell>
                          <TableCell><Typography variant="body2" fontSize={13} color="text.secondary">{row.location}</Typography></TableCell>
                          <TableCell align="center" sx={{ width: 52, py: 0.5 }}>
                            <Tooltip title="Actions" arrow placement="left">
                              <IconButton className="action-icon" size="small"
                                onClick={(e) => { setMenuAnchor(e.currentTarget); setMenuRow(row); }}
                                style={{ opacity: menuRow?.id === row.id ? 1 : undefined }}
                                sx={{ color: 'text.secondary', '&:hover': { color: '#1976d2', bgcolor: '#e3f2fd' } }}>
                                <MoreHorizIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                            <Typography color="text.secondary" fontSize={13}>{loading ? 'Loading resources…' : 'No resources in this group yet.'}</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Pagination + Feedback */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1, borderTop: '1px solid', borderColor: 'divider', flexWrap: 'wrap', gap: 1 }}>
                <PaginationBar
                  page={page}
                  totalPages={totalPages}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={PAGE_SIZE_OPTIONS}
                  onPageChange={setPage}
                  onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(1); }}
                />
                <Button variant="contained" size="small" startIcon={<FeedbackOutlinedIcon sx={{ fontSize: 16 }} />}
                  onClick={() => setFeedbackOpen(true)}
                  sx={{ textTransform: 'none', fontSize: 13, borderRadius: 2, px: 2, boxShadow: '0 2px 8px rgba(25,118,210,0.35)' }}>
                  Feedback
                </Button>
              </Box>
            </Box> {/* end Pane 3 */}

          </Box> {/* end pane2+pane3 side-by-side row */}
        </Box> {/* end right column */}
      </Box> {/* end 3-pane layout */}

      {/* ── Context menu ── */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)}
        onClose={() => { setMenuAnchor(null); setMenuRow(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { minWidth: 150, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', borderRadius: 1 } }}>
        <MenuItem onClick={() => handleDeleteResource(menuRow)} sx={{ fontSize: 14, gap: 1.5, py: 1, color: '#e53935' }}>
          <DeleteOutlineIcon sx={{ fontSize: 17 }} /> Delete
        </MenuItem>
      </Menu>

      <CreateResource
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        groupId={groupId}
        onCreated={() => { fetchData(); showBanner('Resource created successfully.'); }}
      />

      <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </Box>
  );
};

export default ResourceGroupDetail;
