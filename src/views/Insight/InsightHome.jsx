import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  CircularProgress,
  Grid,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import RefreshOutlinedIcon       from '@mui/icons-material/RefreshOutlined';
import LightbulbOutlinedIcon     from '@mui/icons-material/LightbulbOutlined';
import StorageOutlinedIcon       from '@mui/icons-material/StorageOutlined';
import CloudOutlinedIcon         from '@mui/icons-material/CloudOutlined';
import DescriptionOutlinedIcon   from '@mui/icons-material/DescriptionOutlined';
import EventNoteOutlinedIcon     from '@mui/icons-material/EventNoteOutlined';
import ShowChartOutlinedIcon     from '@mui/icons-material/ShowChartOutlined';
import PieChartOutlineOutlinedIcon from '@mui/icons-material/PieChartOutlineOutlined';
import BarChartOutlinedIcon      from '@mui/icons-material/BarChartOutlined';

import ChartCard          from 'components/charts/ChartCard';
import LineChart          from 'components/charts/LineChart';
import PieChart           from 'components/charts/PieChart';
import BarChart           from 'components/charts/BarChart';
import InsightSummaryCard from './InsightSummaryCard';
import { fetchInsightsSummary } from '../../services/insightApi';

// Status → colour map (presentation only; values come from the API).
const STATUS_COLORS = {
  Running: '#43a047', Active: '#43a047', Ongoing: '#43a047', Covered: '#00897b',
  Halted: '#e53935', Inactive: '#9e9e9e', 'Not Covered': '#cfd8dc',
  Maintenance: '#fb8c00', Suspended: '#fb8c00', Paused: '#fbc02d',
  Upcoming: '#1976d2', Completed: '#90a4ae', Unknown: '#bdbdbd',
};
const PALETTE = ['#1976d2', '#7e57c2', '#00897b', '#fb8c00', '#e53935', '#43a047', '#5c6bc0', '#26a69a'];

const toSegments = (statusObj = {}) =>
  Object.entries(statusObj).map(([label, value], i) => ({
    label,
    value: value || 0,
    color: STATUS_COLORS[label] || PALETTE[i % PALETTE.length],
  }));

const InsightHome = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchInsightsSummary();
      setSummary(data && !Array.isArray(data) ? data : {});
    } catch {
      setError(true);
      setSummary({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const s          = summary || {};
  const vms        = s.vms        || {};
  const platforms  = s.platforms  || {};
  const compliance = s.compliance || {};
  const jobs       = s.jobs       || {};

  const vmSegments         = useMemo(() => toSegments(vms.status),        [vms.status]);
  const platformSegments   = useMemo(() => toSegments(platforms.status),  [platforms.status]);
  const complianceSegments = useMemo(() => toSegments(compliance.status), [compliance.status]);
  const jobSegments        = useMemo(() => toSegments(jobs.status),       [jobs.status]);
  const jobCategorySegments = useMemo(
    () => Object.entries(jobs.categories || {}).map(([label, value], i) => ({
      label, value: value || 0, color: PALETTE[i % PALETTE.length],
    })),
    [jobs.categories],
  );

  const cards = [
    {
      key: 'vms', title: 'Virtual Machines', icon: <StorageOutlinedIcon sx={{ fontSize: 22 }} />,
      color: '#7e57c2', bg: '#ede7f6', total: vms.total, running: vms.running,
      runningLabel: 'Running', utilization: vms.utilization, segments: vmSegments, path: '/vms',
    },
    {
      key: 'platforms', title: 'Platforms', icon: <CloudOutlinedIcon sx={{ fontSize: 22 }} />,
      color: '#1976d2', bg: '#e3f2fd', total: platforms.total, running: platforms.running,
      runningLabel: 'Active', utilization: platforms.utilization, segments: platformSegments, path: '/',
    },
    {
      key: 'compliance', title: 'Compliance', icon: <DescriptionOutlinedIcon sx={{ fontSize: 22 }} />,
      color: '#00897b', bg: '#e0f2f1', total: compliance.total, running: compliance.running,
      runningLabel: 'Covered', utilization: compliance.utilization, segments: complianceSegments, path: '/compliances',
    },
    {
      key: 'jobs', title: 'Jobs', icon: <EventNoteOutlinedIcon sx={{ fontSize: 22 }} />,
      color: '#fb8c00', bg: '#fff3e0', total: jobs.total, running: jobs.running,
      runningLabel: 'Active', utilization: jobs.utilization, segments: jobSegments, path: '/calendar',
    },
  ];

  const resources = vms.resources || {};
  const vmTrend   = vms.trend || [];

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        minHeight: '100%',
        bgcolor: 'background.default',
      }}
    >
      {/* Breadcrumb */}
      <Breadcrumbs separator="›" sx={{ mb: 1.5, fontSize: 13 }}>
        <Link
          underline="hover"
          onClick={() => navigate('/dashboard')}
          sx={{ fontSize: 13, color: 'primary.main', fontWeight: 500, cursor: 'pointer' }}
        >
          Home
        </Link>
        <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>Insights</Typography>
      </Breadcrumbs>

      {/* Title row + refresh */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LightbulbOutlinedIcon sx={{ fontSize: 36, color: 'primary.main', mr: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.2, color: 'text.primary' }}>
              Insights
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', maxWidth: 760, lineHeight: 1.7 }}>
            Here you can see Platform, Compliance, Task and Job related information in one place.
            <br />
            Everything created across those modules is reflected here in real time — refresh anytime for the latest.
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <span>
            <IconButton onClick={load} disabled={loading} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
              <RefreshOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Couldn’t load insights. Showing what’s available — try refreshing.
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Per-component summary cards (each with its own chart) */}
          <Grid container spacing={2.5} sx={{ mb: 1 }}>
            {cards.map((c) => (
              <Grid item xs={12} sm={6} md={4} key={c.key}>
                <InsightSummaryCard
                  title={c.title}
                  icon={c.icon}
                  color={c.color}
                  bg={c.bg}
                  total={c.total || 0}
                  running={c.running || 0}
                  runningLabel={c.runningLabel}
                  utilization={c.utilization || 0}
                  segments={c.segments}
                />
              </Grid>
            ))}
          </Grid>

          {/* Charts (varied types): Line graph (VMs by day) · Pie (Compliance) · Bar (Jobs) */}
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={4}>
              <ChartCard
                title="Virtual Machine Details"
                subtitle="Provisioned VMs by day"
                icon={<ShowChartOutlinedIcon sx={{ fontSize: 20 }} />}
                accent="#7e57c2"
              >
                <LineChart data={vmTrend} color="#7e57c2" height={200} />
                <Stack
                  direction="row"
                  justifyContent="space-around"
                  sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}
                >
                  {[
                    { label: 'vCPU',    value: resources.cpu },
                    { label: 'RAM (GB)', value: resources.ram },
                    { label: 'Disk (GB)', value: resources.disk },
                  ].map((r) => (
                    <Box key={r.label} sx={{ textAlign: 'center' }}>
                      <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary' }}>
                        {r.value || 0}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{r.label}</Typography>
                    </Box>
                  ))}
                </Stack>
              </ChartCard>
            </Grid>

            <Grid item xs={12} sm={4}>
              <ChartCard
                title="Platform Compliance"
                subtitle="Coverage across platforms"
                icon={<PieChartOutlineOutlinedIcon sx={{ fontSize: 20 }} />}
                accent="#00897b"
              >
                <PieChart data={complianceSegments} />
              </ChartCard>
            </Grid>

            <Grid item xs={12} sm={4}>
              <ChartCard
                title="Jobs"
                subtitle="By category"
                icon={<BarChartOutlinedIcon sx={{ fontSize: 20 }} />}
                accent="#fb8c00"
              >
                <BarChart data={jobCategorySegments} height={200} />
              </ChartCard>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default InsightHome;
