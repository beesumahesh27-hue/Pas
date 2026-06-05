import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

import CloudOutlinedIcon         from '@mui/icons-material/CloudOutlined';
import StorageOutlinedIcon       from '@mui/icons-material/StorageOutlined';
import DescriptionOutlinedIcon   from '@mui/icons-material/DescriptionOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import LightbulbOutlinedIcon     from '@mui/icons-material/LightbulbOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ArrowForwardOutlinedIcon  from '@mui/icons-material/ArrowForwardOutlined';

const SERVICES = [
  {
    key:   'platforms',
    title: 'Platforms',
    desc:  'Manage your PAS platforms and instances.',
    icon:  <CloudOutlinedIcon sx={{ fontSize: 30 }} />,
    color: '#1976d2',
    bg:    '#e3f2fd',
    path:  '/',
    countFrom: '/api/platforms/',
  },
  {
    key:   'vms',
    title: 'Virtual Machines',
    desc:  'Provision and manage VMs across your fleet.',
    icon:  <StorageOutlinedIcon sx={{ fontSize: 30 }} />,
    color: '#7e57c2',
    bg:    '#ede7f6',
    path:  '/vms',
    countFrom: '/api/vms/',
  },
  {
    key:   'compliances',
    title: 'Compliance',
    desc:  'Track policies and submissions across services.',
    icon:  <DescriptionOutlinedIcon sx={{ fontSize: 30 }} />,
    color: '#00897b',
    bg:    '#e0f2f1',
    path:  '/compliances',
    countFrom: '/api/compliance/submissions',
  },
  {
    key:   'calendar',
    title: 'Calendar',
    desc:  'View jobs, deployments and schedules.',
    icon:  <CalendarTodayOutlinedIcon sx={{ fontSize: 30 }} />,
    color: '#fb8c00',
    bg:    '#fff3e0',
    path:  '/calendar',
    countFrom: '/api/jobs/',
  },
  {
    key:   'insights',
    title: 'Insights',
    desc:  'Visualize utilization, status and trends across services.',
    icon:  <LightbulbOutlinedIcon sx={{ fontSize: 30 }} />,
    color: '#f9a825',
    bg:    '#fff8e1',
    path:  '/insights',
    countFrom: '/api/insights/summary',
  },
  {
    key:   'recycle-bin',
    title: 'Recycle Bin',
    desc:  'Manage resource groups, resources and functions.',
    icon:  <DeleteOutlineOutlinedIcon sx={{ fontSize: 30 }} />,
    color: '#e53935',
    bg:    '#ffebee',
    path:  '/recycle-bin',
    countFrom: '/api/recycle-bin/resource-groups',
  },
];

const tryFetchCount = async (url) => {
  try {
    const { data } = await axios.get(url);
    if (Array.isArray(data)) return data.length;
    if (Array.isArray(data?.items)) return data.items.length;
    return null;
  } catch {
    return null;
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const [counts, setCounts]   = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        SERVICES.map(async (s) => [s.key, await tryFetchCount(s.countFrom)]),
      );
      if (!cancelled) {
        setCounts(Object.fromEntries(entries));
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.default', minHeight: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 22, fontWeight: 700, color: 'text.primary' }}>
          Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>
          Choose a service to get started.
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {SERVICES.map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.key}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                height: '100%',
                transition: 'all 0.18s',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  transform: 'translateY(-2px)',
                  borderColor: s.color,
                },
              }}
            >
              <CardActionArea onClick={() => navigate(s.path)} sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Box sx={{
                      width: 52, height: 52, borderRadius: 2,
                      bgcolor: s.bg, color: s.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {s.icon}
                    </Box>
                    {loading ? (
                      <CircularProgress size={16} />
                    ) : counts[s.key] !== null && counts[s.key] !== undefined ? (
                      <Chip
                        label={counts[s.key]}
                        size="small"
                        sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, height: 22 }}
                      />
                    ) : null}
                  </Stack>
                  <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                    {s.title}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary', minHeight: 38 }}>
                    {s.desc}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1.5, color: s.color }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Open</Typography>
                    <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
