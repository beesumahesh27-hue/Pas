import React from 'react';
import { Box, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material';
import DonutChart from 'components/charts/DonutChart';
import hexToRgba from 'components/charts/hexToRgba';

const InsightSummaryCard = ({
  title,
  icon,
  color = '#1976d2',
  bg = '#e3f2fd',
  total = 0,
  running = 0,
  runningLabel = 'Running',
  utilization = 0,
  segments = [],
}) => (
  <Card
    variant="outlined"
    sx={{
      height: '100%',
      borderColor: 'divider',
      borderRadius: 2,
      transition: 'all 0.18s',
      '&:hover': {
        boxShadow: `0 8px 24px ${hexToRgba(color, 0.3)}`,
        transform: 'translateY(-2px)',
        borderColor: color,
      },
    }}
  >
    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40, height: 40, borderRadius: 1.5, bgcolor: bg, color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
              {title}
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>
              {total} total
            </Typography>
          </Box>
        </Stack>
      </Stack>

      {/* Donut: status breakdown + running count in the center.
          Hovering a coloured segment shows that status's detail only. */}
      <DonutChart
        data={segments}
        size={132}
        thickness={18}
        centerPrimary={running}
        centerSecondary={runningLabel}
      />

      {/* Utilization */}
      <Box sx={{ mt: 2 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
          <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>Utilization</Typography>
          <Typography sx={{ fontSize: 11.5, fontWeight: 700, color }}>{utilization}%</Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, Math.max(0, utilization))}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: bg,
            '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
          }}
        />
      </Box>
    </CardContent>
  </Card>
);

export default InsightSummaryCard;
