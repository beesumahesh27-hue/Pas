import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import StorageIcon from '@mui/icons-material/Storage';
import WifiIcon from '@mui/icons-material/Wifi';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import HistoryIcon from '@mui/icons-material/History';
import TuneIcon from '@mui/icons-material/Tune';

import api from '../../services/api';

const NAV_TABS = [
  { label: 'Overview',       path: '',          icon: <DashboardOutlinedIcon sx={{ fontSize: 17 }} /> },
  { label: 'Disks',          path: '/disks',    icon: <StorageIcon sx={{ fontSize: 17 }} /> },
  { label: "VIF's",          path: '/vifs',     icon: <WifiIcon sx={{ fontSize: 17 }} /> },
  { label: 'Snapshots',      path: '/snapshots',icon: <CameraAltOutlinedIcon sx={{ fontSize: 17 }} /> },
  { label: 'Activity Logs',  path: '/activity', icon: <HistoryIcon sx={{ fontSize: 17 }} /> },
  { label: 'Scale Config',   path: '/scale',    icon: <TuneIcon sx={{ fontSize: 17 }} /> },
];

const VMDetailMain = () => {
  const { id: vmId } = useParams();
  const navigate     = useNavigate();
  const location     = useLocation();

  const [currentVm, setCurrentVm]       = useState(null);
  const [vmList, setVmList]             = useState([]);
  const [listCollapsed, setListCollapsed] = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');

  useEffect(() => {
    if (vmId) {
      api.get(`/vms/${vmId}`).then(({ data }) => setCurrentVm(data)).catch(() => {});
    }
  }, [vmId]);

  useEffect(() => {
    api.get('/vms/').then(({ data }) => setVmList(data)).catch(() => {});
  }, []);

  const filteredList = vmList.filter((vm) =>
    !searchQuery || vm.vm_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const isActiveTab = (tab) => {
    const base = `/vms/${vmId}`;
    if (tab.path === '') {
      return location.pathname === base || location.pathname === base + '/';
    }
    return location.pathname === base + tab.path;
  };

  const handleRefreshList = () => {
    api.get('/vms/').then(({ data }) => setVmList(data)).catch(() => {});
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 52px)', overflow: 'hidden' }}>

      {/* LEFT: VM list sidebar */}
      {!listCollapsed ? (
        <Box sx={{ width: 260, borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          {/* Sidebar header */}
          <Box sx={{ p: 1, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon sx={{ fontSize: 15 }} />}
              onClick={() => navigate('/vms')}
              sx={{ textTransform: 'none', fontSize: 12, px: 1.5, py: 0.5, flexShrink: 0 }}
            >
              Create
            </Button>
            <IconButton size="small" onClick={handleRefreshList} sx={{ ml: 0.25 }}>
              <RefreshIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <Box sx={{ flex: 1 }} />
            <IconButton size="small" onClick={() => setListCollapsed(true)}>
              <ChevronLeftIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* Search */}
          <Box sx={{ px: 1, py: 0.75 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search VM Name, UUID, IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ sx: { fontSize: 12 } }}
            />
          </Box>

          {/* VM list */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {filteredList.map((vm) => (
              <Box
                key={vm.id}
                onClick={() => navigate(`/vms/${vm.id}`)}
                sx={{
                  px: 2,
                  py: 1,
                  cursor: 'pointer',
                  bgcolor: String(vm.id) === String(vmId) ? '#e3f2fd' : 'transparent',
                  '&:hover': { bgcolor: String(vm.id) === String(vmId) ? '#e3f2fd' : '#f5f5f5' },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    color: '#1976d2',
                    fontWeight: String(vm.id) === String(vmId) ? 600 : 400,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 190,
                  }}
                >
                  {vm.vm_name}
                </Typography>
                <InfoOutlinedIcon
                  sx={{ fontSize: 15, color: String(vm.id) === String(vmId) ? '#1976d2' : '#9e9e9e', flexShrink: 0 }}
                />
              </Box>
            ))}
            {filteredList.length === 0 && (
              <Typography sx={{ fontSize: 12, color: '#9e9e9e', px: 2, py: 2 }}>
                No VMs found
              </Typography>
            )}
          </Box>
        </Box>
      ) : (
        <Box sx={{ width: 24, borderRight: '1px solid #e0e0e0', display: 'flex', alignItems: 'flex-start', pt: 1, flexShrink: 0 }}>
          <IconButton size="small" onClick={() => setListCollapsed(false)}>
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      )}

      {/* RIGHT: Header + Tabs + Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Title bar */}
        <Box sx={{
          px: 3, py: 1.25, borderBottom: '1px solid #e0e0e0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 17, color: '#1a1a1a' }}>
            {currentVm?.vm_name ?? 'Loading...'}
          </Typography>
          <IconButton size="small" onClick={() => navigate('/vms')}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Main area: vertical nav + content */}
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Vertical nav */}
          <Box sx={{ width: 168, borderRight: '1px solid #e0e0e0', py: 0.5, flexShrink: 0, overflowY: 'auto' }}>
            {NAV_TABS.map((tab) => {
              const active = isActiveTab(tab);
              return (
                <Box
                  key={tab.label}
                  onClick={() => navigate(`/vms/${vmId}${tab.path}`)}
                  sx={{
                    px: 2,
                    py: 1.25,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    bgcolor: active ? '#e3f2fd' : 'transparent',
                    color: active ? '#1976d2' : '#424242',
                    borderLeft: active ? '3px solid #1976d2' : '3px solid transparent',
                    '&:hover': { bgcolor: active ? '#e3f2fd' : '#f5f5f5' },
                    transition: 'background 0.15s',
                  }}
                >
                  <Box sx={{ color: 'inherit', display: 'flex', alignItems: 'center' }}>
                    {tab.icon}
                  </Box>
                  <Typography sx={{ fontSize: 13, fontWeight: active ? 600 : 400, color: 'inherit' }}>
                    {tab.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Tab content */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <Outlet context={{ vmData: currentVm, vmId }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default VMDetailMain;
