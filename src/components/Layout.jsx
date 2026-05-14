import React, { useState, useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
  InputBase,
  ListItemIcon,
  Menu,
  MenuItem,
  Popover,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';

import SearchIcon                     from '@mui/icons-material/Search';
import NotificationsOutlinedIcon      from '@mui/icons-material/NotificationsOutlined';
import KeyboardArrowDownIcon          from '@mui/icons-material/KeyboardArrowDown';
import DarkModeOutlinedIcon           from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon          from '@mui/icons-material/LightModeOutlined';
import CloudOutlinedIcon              from '@mui/icons-material/CloudOutlined';
import PersonOutlinedIcon             from '@mui/icons-material/PersonOutlined';
import ManageAccountsOutlinedIcon     from '@mui/icons-material/ManageAccountsOutlined';
import BusinessOutlinedIcon           from '@mui/icons-material/BusinessOutlined';
import PeopleOutlinedIcon             from '@mui/icons-material/PeopleOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import EmailOutlinedIcon              from '@mui/icons-material/EmailOutlined';
import BadgeOutlinedIcon              from '@mui/icons-material/BadgeOutlined';
import LogoutOutlinedIcon             from '@mui/icons-material/LogoutOutlined';
import SettingsOutlinedIcon           from '@mui/icons-material/SettingsOutlined';
import DescriptionOutlinedIcon        from '@mui/icons-material/DescriptionOutlined';
import CalendarTodayOutlinedIcon      from '@mui/icons-material/CalendarTodayOutlined';
import LightbulbOutlinedIcon          from '@mui/icons-material/LightbulbOutlined';
import DeleteOutlineIcon              from '@mui/icons-material/DeleteOutline';
import TaskAltOutlinedIcon            from '@mui/icons-material/TaskAltOutlined';
import AccountTreeOutlinedIcon        from '@mui/icons-material/AccountTreeOutlined';
import CurrencyRupeeIcon              from '@mui/icons-material/CurrencyRupee';
import HeadsetMicOutlinedIcon         from '@mui/icons-material/HeadsetMicOutlined';
import BuildOutlinedIcon              from '@mui/icons-material/BuildOutlined';
import HubOutlinedIcon                from '@mui/icons-material/HubOutlined';
import StorefrontOutlinedIcon         from '@mui/icons-material/StorefrontOutlined';
import ChatBubbleOutlineIcon          from '@mui/icons-material/ChatBubbleOutline';

const RAIL_W = 56;

const NAV_GROUPS = [
  {
    label: 'FAVOURITES',
    items: [
      { icon: <CloudOutlinedIcon sx={{ fontSize: 20 }} />,         label: 'Platforms',    path: '/' },
      { icon: <DescriptionOutlinedIcon sx={{ fontSize: 20 }} />,   label: 'Compliances',  path: '/compliances' },
      { icon: <TaskAltOutlinedIcon sx={{ fontSize: 20 }} />,       label: 'Tasks',        path: '/vms' },
    ],
  },
  {
    label: 'DASHBOARDS',
    items: [
      { icon: <CalendarTodayOutlinedIcon sx={{ fontSize: 20 }} />, label: 'Calendar',     path: null },
      { icon: <LightbulbOutlinedIcon sx={{ fontSize: 20 }} />,     label: 'Insights',     path: null },
      { icon: <DeleteOutlineIcon sx={{ fontSize: 20 }} />,         label: 'Recycle Bin',  path: null },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { icon: <SettingsOutlinedIcon sx={{ fontSize: 20 }} />,      label: 'Settings',     path: null },
      { icon: <AccountTreeOutlinedIcon sx={{ fontSize: 20 }} />,   label: 'Organization', path: null },
      { icon: <CurrencyRupeeIcon sx={{ fontSize: 20 }} />,         label: 'Billing',      path: null },
    ],
  },
  {
    label: 'TOOLS & SUPPORT',
    items: [
      { icon: <HeadsetMicOutlinedIcon sx={{ fontSize: 20 }} />,    label: 'Support',      path: null },
      { icon: <BuildOutlinedIcon sx={{ fontSize: 20 }} />,         label: 'Tools',        path: null },
      { icon: <BadgeOutlinedIcon sx={{ fontSize: 20 }} />,         label: 'Identity',     path: null },
      { icon: <HubOutlinedIcon sx={{ fontSize: 20 }} />,           label: 'Network Hub',  path: null },
      { icon: <StorefrontOutlinedIcon sx={{ fontSize: 20 }} />,    label: 'Marketplace',  path: null },
    ],
  },
];

const NAV_ITEMS = NAV_GROUPS.flatMap(g => g.items);

const Layout = ({ children }) => {
  const [darkMode, setDarkMode]           = useState(false);
  const [adminAnchor, setAdminAnchor]     = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  const theme = useMemo(() =>
    createTheme({ palette: { mode: darkMode ? 'dark' : 'light' } }),
    [darkMode],
  );

  const isActive = (path) =>
    path ? (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)) : false;

  return (
    <ThemeProvider theme={theme}>
      {/* Root: full viewport, side-by-side */}
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>

        {/* ════════════════════════════════════════
            LEFT: Collapsed icon rail — full height
        ════════════════════════════════════════ */}
        <Box
          onMouseEnter={() => setSidebarOpen(true)}
          onMouseLeave={() => setSidebarOpen(false)}
          sx={{
            width: RAIL_W,
            flexShrink: 0,
            height: '100vh',
            bgcolor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 1300,
            borderRight: '1px solid #e0e0e0',
            overflowY: 'auto',
            overflowX: 'hidden',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}
        >
          {/* Logo mark */}
          <Box sx={{ width: RAIL_W, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, bgcolor: '#0a1929', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <CloudOutlinedIcon sx={{ color: '#42a5f5', fontSize: 24 }} />
          </Box>

          {/* Nav icons */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 1, pb: 1, gap: 0.25, width: '100%' }}>
            {NAV_ITEMS.map(({ icon, label, path }) => {
              const active = isActive(path);
              return (
                <Tooltip key={label} title={sidebarOpen ? '' : label} placement="right" arrow>
                  <Box
                    onClick={() => { if (path) { navigate(path); setSidebarOpen(false); } }}
                    sx={{
                      width: 38, height: 38,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 1.5,
                      cursor: path ? 'pointer' : 'default',
                      color: active ? '#1976d2' : '#9e9e9e',
                      bgcolor: active ? '#e3f2fd' : 'transparent',
                      transition: 'all 0.15s',
                      '&:hover': {
                        bgcolor: path ? (active ? '#dbeafe' : '#f1f5f9') : 'transparent',
                        color: path ? (active ? '#1976d2' : '#424242') : '#9e9e9e',
                      },
                    }}
                  >
                    {icon}
                  </Box>
                </Tooltip>
              );
            })}

            <Box sx={{ flex: 1 }} />

            {/* Feedback icon */}
            <Tooltip title={sidebarOpen ? '' : 'Feedback'} placement="right" arrow>
              <Box sx={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1.5, cursor: 'pointer', color: '#9e9e9e', '&:hover': { bgcolor: '#f1f5f9', color: '#424242' } }}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 19 }} />
              </Box>
            </Tooltip>
          </Box>
        </Box>

        {/* ════════════════════════════════════════
            Expanded overlay panel (hover)
        ════════════════════════════════════════ */}
        {sidebarOpen && (
          <Box
            onMouseEnter={() => setSidebarOpen(true)}
            onMouseLeave={() => setSidebarOpen(false)}
            sx={{
              position: 'fixed',
              top: 0,
              left: RAIL_W,
              width: 224,
              height: '100vh',
              bgcolor: '#fff',
              boxShadow: '4px 0 24px rgba(0,0,0,0.18)',
              zIndex: 1299,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              animation: 'slideIn 0.18s ease',
              '@keyframes slideIn': {
                from: { opacity: 0, transform: 'translateX(-10px)' },
                to:   { opacity: 1, transform: 'translateX(0)' },
              },
            }}
          >
            {/* Logo row inside overlay */}
            <Box sx={{ height: 52, display: 'flex', alignItems: 'center', gap: 1.5, px: 2, flexShrink: 0, borderBottom: '1px solid #f0f0f0' }}>
              <CloudOutlinedIcon sx={{ color: '#1976d2', fontSize: 22 }} />
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', letterSpacing: 0.3 }}>
                Place2place
              </Typography>
            </Box>

            {/* Groups */}
            <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
              {NAV_GROUPS.map((group) => (
                <Box key={group.label} sx={{ mb: 0.5 }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#b0b8c4', letterSpacing: 1, px: 2.5, pt: 1.5, pb: 0.5, textTransform: 'uppercase' }}>
                    {group.label}
                  </Typography>
                  {group.items.map(({ icon, label, path }) => {
                    const active = isActive(path);
                    return (
                      <Box
                        key={label}
                        onClick={() => { if (path) { navigate(path); setSidebarOpen(false); } }}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 1.5,
                          mx: 1.5, px: 1.5, py: 0.9, borderRadius: 1.5,
                          cursor: path ? 'pointer' : 'default',
                          bgcolor: active ? '#e8f1fd' : 'transparent',
                          color: active ? '#1976d2' : '#374151',
                          borderLeft: active ? '3px solid #1976d2' : '3px solid transparent',
                          transition: 'all 0.15s',
                          '&:hover': {
                            bgcolor: path ? (active ? '#dbeafe' : '#f1f5f9') : 'transparent',
                            color: path ? (active ? '#1976d2' : '#111827') : '#374151',
                          },
                        }}
                      >
                        <Box sx={{ color: active ? '#1976d2' : '#6b7280', display: 'flex', alignItems: 'center' }}>
                          {icon}
                        </Box>
                        <Typography sx={{ fontSize: 13, fontWeight: active ? 600 : 400, whiteSpace: 'nowrap', color: 'inherit' }}>
                          {label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>

            {/* Feedback at bottom */}
            <Box
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                mx: 1.5, px: 1.5, py: 1, mb: 1, borderRadius: 1.5, cursor: 'pointer',
                color: '#6b7280', borderLeft: '3px solid transparent',
                '&:hover': { bgcolor: '#f1f5f9', color: '#111827' },
                flexShrink: 0,
              }}
            >
              <ChatBubbleOutlineIcon sx={{ fontSize: 20 }} />
              <Typography sx={{ fontSize: 13, whiteSpace: 'nowrap' }}>Feedback</Typography>
            </Box>
          </Box>
        )}

        {/* ════════════════════════════════════════
            RIGHT: AppBar + page content
        ════════════════════════════════════════ */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* ── Top Navbar ── */}
          <AppBar position="static" elevation={0} sx={{ bgcolor: '#0a1929', height: 52, flexShrink: 0 }}>
            <Toolbar sx={{ minHeight: '52px !important', px: 2, gap: 1.5, position: 'relative' }}>

              {/* Brand name */}
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: 0.4, mr: 2, whiteSpace: 'nowrap' }}>
                Place2place
              </Typography>

              {/* Search bar — absolutely centered in the toolbar */}
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100%',
                  maxWidth: 520,
                  bgcolor: '#fff',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  px: 1.5,
                  height: 34,
                }}
              >
                <SearchIcon sx={{ color: '#9e9e9e', fontSize: 18, mr: 1 }} />
                <InputBase
                  placeholder="Search resources and services (Ctrl+G or Ctrl+Alt+E)"
                  sx={{
                    flex: 1,
                    fontSize: 13,
                    color: '#333',
                    '& input::placeholder': { color: '#9e9e9e', opacity: 1 },
                  }}
                />
              </Box>

              <Box sx={{ flex: 1 }} />

              {/* Notification */}
              <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)', p: 0.75 }}>
                <NotificationsOutlinedIcon sx={{ fontSize: 20 }} />
              </IconButton>

              {/* Admin dropdown */}
              <Box
                onClick={(e) => setAdminAnchor(e.currentTarget)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.25, cursor: 'pointer',
                  px: 0.75, py: 0.25, borderRadius: 1,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                }}
              >
                <Typography sx={{ color: '#fff', fontSize: 14 }}>Admin</Typography>
                <KeyboardArrowDownIcon sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 18 }} />
              </Box>

              {/* Dark / Light mode */}
              <IconButton
                size="small"
                onClick={() => setDarkMode(prev => !prev)}
                sx={{ color: 'rgba(255,255,255,0.7)', p: 0.75 }}
              >
                {darkMode
                  ? <LightModeOutlinedIcon sx={{ fontSize: 20, color: '#ffd54f' }} />
                  : <DarkModeOutlinedIcon sx={{ fontSize: 20 }} />}
              </IconButton>

              {/* Avatar */}
              <Avatar
                onClick={(e) => setProfileAnchor(e.currentTarget)}
                sx={{
                  width: 30, height: 30,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                  '&:hover': { boxShadow: '0 0 0 2px #42a5f5' },
                }}
              >
                <PersonOutlinedIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.8)' }} />
              </Avatar>

            </Toolbar>
          </AppBar>

          {/* ── Page content ── */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {children}
          </Box>
        </Box>

        {/* ════════════════════════════════════════
            Menus / Popovers (portalled — position agnostic)
        ════════════════════════════════════════ */}

        {/* Admin Role Menu */}
        <Menu
          anchorEl={adminAnchor}
          open={Boolean(adminAnchor)}
          onClose={() => setAdminAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { minWidth: 210, mt: 0.75, boxShadow: '0 4px 16px rgba(0,0,0,0.14)', borderRadius: 1.5 } }}
        >
          <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Switch Role
            </Typography>
          </Box>
          {[
            { label: 'Admin',       icon: <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 18 }} />, active: true },
            { label: 'Super Admin', icon: <ManageAccountsOutlinedIcon    sx={{ fontSize: 18 }} /> },
            { label: 'Tenant',      icon: <BusinessOutlinedIcon          sx={{ fontSize: 18 }} /> },
            { label: 'User',        icon: <PeopleOutlinedIcon            sx={{ fontSize: 18 }} /> },
          ].map(({ label, icon, active }) => (
            <MenuItem
              key={label}
              onClick={() => setAdminAnchor(null)}
              sx={{ fontSize: 14, gap: 1.5, py: 1, px: 2, ...(active && { color: 'primary.main', fontWeight: 600 }) }}
            >
              <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>{icon}</ListItemIcon>
              {label}
              {active && <Chip label="Current" size="small" color="primary" sx={{ ml: 'auto', height: 18, fontSize: 10 }} />}
            </MenuItem>
          ))}
        </Menu>

        {/* Profile Popover */}
        <Popover
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={() => setProfileAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { width: 292, mt: 0.75, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: 1.5 } }}
        >
          <Box sx={{ px: 2.5, pt: 2.5, pb: 2, textAlign: 'center' }}>
            <Avatar sx={{ width: 60, height: 60, bgcolor: '#1976d2', mx: 'auto', mb: 1.25, fontSize: 22, fontWeight: 700 }}>
              MB
            </Avatar>
            <Typography sx={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>Mahesh Beesu</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
              <EmailOutlinedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>mahesh.beesu@esds.co.in</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
              <BadgeOutlinedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Administrator</Typography>
            </Box>
            <Chip label="Admin" size="small" color="primary" variant="outlined" sx={{ mt: 1, height: 22, fontSize: 11 }} />
          </Box>

          <Divider />

          <Box sx={{ p: 1 }}>
            <MenuItem sx={{ borderRadius: 1, gap: 1.5, fontSize: 14, py: 1 }} onClick={() => setProfileAnchor(null)}>
              <ListItemIcon sx={{ minWidth: 0 }}><PersonOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></ListItemIcon>
              My Profile
            </MenuItem>
            <MenuItem sx={{ borderRadius: 1, gap: 1.5, fontSize: 14, py: 1 }} onClick={() => setProfileAnchor(null)}>
              <ListItemIcon sx={{ minWidth: 0 }}><SettingsOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></ListItemIcon>
              Settings
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem sx={{ borderRadius: 1, gap: 1.5, fontSize: 14, py: 1, color: '#e53935' }} onClick={() => setProfileAnchor(null)}>
              <ListItemIcon sx={{ minWidth: 0 }}><LogoutOutlinedIcon sx={{ fontSize: 18, color: '#e53935' }} /></ListItemIcon>
              Sign Out
            </MenuItem>
          </Box>
        </Popover>

      </Box>
    </ThemeProvider>
  );
};

export default Layout;
