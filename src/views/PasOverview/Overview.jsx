import React, { useState, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';

import ArrowBackIcon              from '@mui/icons-material/ArrowBack';
import MemoryOutlinedIcon         from '@mui/icons-material/MemoryOutlined';
import PeopleOutlineIcon          from '@mui/icons-material/PeopleOutline';
import AccessTimeOutlinedIcon     from '@mui/icons-material/AccessTimeOutlined';
import CalendarTodayOutlinedIcon  from '@mui/icons-material/CalendarTodayOutlined';
import InfoOutlinedIcon           from '@mui/icons-material/InfoOutlined';
import DnsOutlinedIcon            from '@mui/icons-material/DnsOutlined';
import HistoryOutlinedIcon        from '@mui/icons-material/HistoryOutlined';
import AddCircleOutlineIcon       from '@mui/icons-material/AddCircleOutline';
import CheckCircleOutlineIcon     from '@mui/icons-material/CheckCircleOutline';
import PersonOutlineIcon          from '@mui/icons-material/PersonOutline';
import TrendingUpIcon             from '@mui/icons-material/TrendingUp';

import api from '../../services/api';

const getStatusColor = (s) => ({ Active: 'success', Inactive: 'error', Maintenance: 'warning' }[s] ?? 'default');

const buildStatCards = (p) => [
  {
    label:   'CPU Cores',
    value:   p?.cpu,
    color:   '#1976d2',
    hoverBg: '#e3f2fd',
    border:  '#90caf9',
    iconBg:  '#ddeeff',
    tooltip: 'Total CPU cores allocated to this platform',
    icon:    <MemoryOutlinedIcon sx={{ fontSize: 26, color: '#1976d2' }} />,
  },
  {
    label:   'Active Users',
    value:   p?.users,
    color:   '#43a047',
    hoverBg: '#e8f5e9',
    border:  '#a5d6a7',
    iconBg:  '#e8f5e9',
    tooltip: 'Number of users currently on this platform',
    icon:    <PeopleOutlineIcon sx={{ fontSize: 26, color: '#43a047' }} />,
  },
  {
    label:   'Uptime',
    value:   p?.uptime,
    color:   '#7b1fa2',
    hoverBg: '#f3e5f5',
    border:  '#ce93d8',
    iconBg:  '#f3e5f5',
    tooltip: 'Platform availability percentage',
    icon:    <AccessTimeOutlinedIcon sx={{ fontSize: 26, color: '#7b1fa2' }} />,
  },
  {
    label:   'Created Date',
    value:   p?.created_date,
    color:   '#f57c00',
    hoverBg: '#fff3e0',
    border:  '#ffcc80',
    iconBg:  '#fff3e0',
    tooltip: 'Date this platform was first created',
    icon:    <CalendarTodayOutlinedIcon sx={{ fontSize: 26, color: '#f57c00' }} />,
  },
];

const activityIcon = (type) => ({
  create: <AddCircleOutlineIcon   sx={{ fontSize: 18, color: '#1976d2' }} />,
  status: <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#43a047' }} />,
  users:  <PersonOutlineIcon      sx={{ fontSize: 18, color: '#7b1fa2' }} />,
  uptime: <TrendingUpIcon         sx={{ fontSize: 18, color: '#f57c00' }} />,
}[type] ?? <HistoryOutlinedIcon sx={{ fontSize: 18, color: '#757575' }} />);


const Overview = () => {
  const { platformData } = useOutletContext();
  const navigate = useNavigate();

  const [tabValue, setTabValue]             = useState(0);
  const [loadedTabs, setLoadedTabs]         = useState(new Set([0]));

  const [instances, setInstances]           = useState([]);
  const [instancesLoading, setInstancesLoading] = useState(false);
  const [activity, setActivity]             = useState([]);
  const [activityLoading, setActivityLoading]   = useState(false);

  const fetchInstances = useCallback(() => {
    if (!platformData?.pas_id) return;
    setInstancesLoading(true);
    api.get(`/platforms/${platformData.pas_id}/instances/`)
      .then(({ data }) => setInstances(data))
      .catch(() => setInstances([]))
      .finally(() => setInstancesLoading(false));
  }, [platformData?.pas_id]);

  const fetchActivity = useCallback(() => {
    if (!platformData?.pas_id) return;
    setActivityLoading(true);
    api.get(`/platforms/${platformData.pas_id}/activity/`)
      .then(({ data }) => setActivity(data))
      .catch(() => setActivity([]))
      .finally(() => setActivityLoading(false));
  }, [platformData?.pas_id]);

  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
    if (!loadedTabs.has(newValue)) {
      setLoadedTabs(prev => new Set([...prev, newValue]));
      if (newValue === 1) fetchInstances();
      if (newValue === 2) fetchActivity();
    }
  };

  const statCards = buildStatCards(platformData);

  return (
    <Box sx={{ width: '100%', p: 3 }}>

      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        variant="text"
        sx={{ textTransform: 'none', mb: 2, color: '#374151' }}
      >
        Back to Platforms
      </Button>

      {/* Header */}
      <Paper
        elevation={0}
        sx={{ p: 3, mb: 3, backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 2 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5, color: '#111827' }}>
          {platformData?.pas_name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip
            label={platformData?.status}
            color={getStatusColor(platformData?.status)}
            variant="outlined"
            size="small"
          />
          <Typography variant="body2" color="textSecondary">ID: {platformData?.pas_id}</Typography>
          <Typography variant="body2" color="textSecondary">Type: {platformData?.type}</Typography>
          <Typography variant="body2" color="textSecondary">Region: {platformData?.region}</Typography>
        </Box>
      </Paper>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Tooltip title={card.tooltip} arrow placement="top">
              <Card
                elevation={0}
                sx={{
                  border: `1px solid ${card.border}`,
                  borderRadius: 2,
                  cursor: 'default',
                  transition: 'all 0.22s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${card.border}`,
                    backgroundColor: card.hoverBg,
                    borderColor: card.color,
                  },
                }}
              >
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#6b7280' }}>
                      {card.label}
                    </Typography>
                    <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: card.iconBg }}>
                      {card.icon}
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: 26, fontWeight: 700, color: card.color, lineHeight: 1 }}>
                    {card.value ?? '—'}
                  </Typography>
                </CardContent>
              </Card>
            </Tooltip>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e5e7eb' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: '1px solid #e5e7eb', px: 2 }}
        >
          <Tab
            icon={<InfoOutlinedIcon sx={{ fontSize: 17 }} />}
            iconPosition="start"
            label="Overview"
            sx={{ textTransform: 'none', minHeight: 48, fontSize: 14 }}
          />
          <Tab
            icon={<DnsOutlinedIcon sx={{ fontSize: 17 }} />}
            iconPosition="start"
            label="Instances"
            sx={{ textTransform: 'none', minHeight: 48, fontSize: 14 }}
          />
          <Tab
            icon={<HistoryOutlinedIcon sx={{ fontSize: 17 }} />}
            iconPosition="start"
            label="Activity"
            sx={{ textTransform: 'none', minHeight: 48, fontSize: 14 }}
          />
        </Tabs>

        {/* ── Overview Tab ── */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>

            {/* Description */}
            <Box sx={{ mb: 3, p: 2.5, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e5e7eb' }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', mb: 1, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Description
              </Typography>
              <Typography sx={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>
                {platformData?.description || '—'}
              </Typography>
            </Box>

            {/* Platform Details */}
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#6b7280', mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Platform Details
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                { label: 'Platform ID',   value: platformData?.pas_id },
                { label: 'Platform Name', value: platformData?.pas_name },
                { label: 'Region',        value: platformData?.region },
                { label: 'Status',        value: platformData?.status, isChip: true },
                { label: 'Platform Type', value: platformData?.type },
                { label: 'Created Date',  value: platformData?.created_date },
              ].map(({ label, value, isChip }) => (
                <Grid item xs={12} sm={6} md={4} key={label}>
                  <Box sx={{ p: 2, backgroundColor: '#f9fafb', borderRadius: 1.5, border: '1px solid #f3f4f6', height: '100%', transition: 'border-color 0.18s', '&:hover': { borderColor: '#d1d5db' } }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                      {label}
                    </Typography>
                    {isChip
                      ? <Chip label={value} color={getStatusColor(value)} variant="outlined" size="small" />
                      : <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{value ?? '—'}</Typography>
                    }
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Performance */}
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#6b7280', mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Performance & Capacity
            </Typography>
            <Grid container spacing={2}>
              {[
                { label: 'CPU Cores',    value: platformData?.cpu,    unit: 'cores' },
                { label: 'Active Users', value: platformData?.users,  unit: 'users' },
                { label: 'Uptime',       value: platformData?.uptime, unit: '' },
              ].map(({ label, value, unit }) => (
                <Grid item xs={12} sm={4} key={label}>
                  <Box sx={{ p: 2, backgroundColor: '#f9fafb', borderRadius: 1.5, border: '1px solid #f3f4f6', transition: 'border-color 0.18s', '&:hover': { borderColor: '#d1d5db' } }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                      {label}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                      <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{value ?? '—'}</Typography>
                      {unit && <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>{unit}</Typography>}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>

          </Box>
        )}

        {/* ── Instances Tab ── */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 600, color: '#111827' }}>
              Related Instances
            </Typography>

            {instancesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress size={32} />
              </Box>
            ) : instances.length === 0 ? (
              <Box sx={{ py: 5, textAlign: 'center', color: '#9ca3af' }}>
                <DnsOutlinedIcon sx={{ fontSize: 44, mb: 1, opacity: 0.35 }} />
                <Typography sx={{ fontSize: 14 }}>No instances found for this platform.</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                    <TableRow>
                      {['Instance ID', 'Instance Name', 'CPU', 'Memory (GB)', 'Status'].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 700, color: '#374151', fontSize: 13, py: 1.5 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {instances.map((inst) => (
                      <TableRow
                        key={inst.instance_id}
                        sx={{ '&:hover': { backgroundColor: '#f0f7ff' }, cursor: 'default', transition: 'background 0.15s' }}
                      >
                        <TableCell sx={{ color: '#6b7280', fontSize: 13 }}>{inst.instance_id}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{inst.instance_name}</TableCell>
                        <TableCell>{inst.cpu}</TableCell>
                        <TableCell>{inst.memory}</TableCell>
                        <TableCell>
                          <Chip label={inst.status} color={getStatusColor(inst.status)} size="small" variant="outlined" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* ── Activity Tab ── */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 600, color: '#111827' }}>
              Activity Log
            </Typography>

            {activityLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress size={32} />
              </Box>
            ) : activity.length === 0 ? (
              <Box sx={{ py: 5, textAlign: 'center', color: '#9ca3af' }}>
                <HistoryOutlinedIcon sx={{ fontSize: 44, mb: 1, opacity: 0.35 }} />
                <Typography sx={{ fontSize: 14 }}>No activity recorded.</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {activity.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      p: 2,
                      backgroundColor: '#f9fafb',
                      borderRadius: 1.5,
                      border: '1px solid #f3f4f6',
                      transition: 'all 0.18s',
                      '&:hover': { backgroundColor: '#f0f7ff', borderColor: '#90caf9' },
                    }}
                  >
                    <Box sx={{ mt: 0.25 }}>{activityIcon(item.type)}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>
                        {item.event}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: '#9ca3af', mt: 0.25 }}>
                        {new Date(item.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Overview;
