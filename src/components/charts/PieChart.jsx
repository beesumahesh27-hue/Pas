import React from 'react';
import { Box, Stack, Tooltip, Typography, useTheme } from '@mui/material';

const polar = (cx, cy, r, angleRad) => [
  cx + r * Math.cos(angleRad),
  cy + r * Math.sin(angleRad),
];

/**
 * Reusable SVG pie chart — no external charting dependency.
 *
 * @param {Array<{label: string, value: number, color: string}>} data
 * @param {number} size  diameter in px
 * @param {boolean} showLegend
 */
const PieChart = ({ data = [], size = 168, showLegend = true }) => {
  const theme = useTheme();
  const segments = data.filter((d) => (d.value || 0) > 0);
  const total = segments.reduce((sum, d) => sum + (d.value || 0), 0);
  const r = size / 2;
  const cx = r;
  const cy = r;

  let startAngle = -Math.PI / 2; // begin at 12 o'clock

  return (
    <Stack direction="row" alignItems="center" spacing={2.5} flexWrap="wrap" justifyContent="center">
      <Box sx={{ width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="pie chart">
          {total === 0 ? (
            <circle cx={cx} cy={cy} r={r} fill={theme.palette.divider} />
          ) : segments.length === 1 ? (
            <Tooltip arrow followCursor title={`${segments[0].label}: ${segments[0].value} (100%)`}>
              <circle cx={cx} cy={cy} r={r} fill={segments[0].color} style={{ cursor: 'pointer' }} />
            </Tooltip>
          ) : (
            segments.map((seg) => {
              const angle = (seg.value / total) * 2 * Math.PI;
              const endAngle = startAngle + angle;
              const [x1, y1] = polar(cx, cy, r, startAngle);
              const [x2, y2] = polar(cx, cy, r, endAngle);
              const largeArc = angle > Math.PI ? 1 : 0;
              const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
              const pct = Math.round((seg.value / total) * 100);
              startAngle = endAngle;
              return (
                <Tooltip key={seg.label} arrow followCursor title={`${seg.label}: ${seg.value} (${pct}%)`}>
                  <path
                    d={path}
                    fill={seg.color}
                    stroke={theme.palette.background.paper}
                    strokeWidth={1.5}
                    style={{ cursor: 'pointer' }}
                  />
                </Tooltip>
              );
            })
          )}
        </svg>
      </Box>

      {showLegend && segments.length > 0 && (
        <Stack spacing={0.75} sx={{ minWidth: 120 }}>
          {data.map((seg) => {
            const pct = total ? Math.round((seg.value / total) * 100) : 0;
            return (
              <Stack key={seg.label} direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: seg.color, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 12.5, color: 'text.primary', flex: 1 }}>{seg.label}</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'text.primary' }}>
                  {seg.value} ({pct}%)
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
};

export default PieChart;
