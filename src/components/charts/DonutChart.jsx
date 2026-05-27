import React from 'react';
import { Box, Stack, Tooltip, Typography, useTheme } from '@mui/material';

/**
 * Reusable SVG donut chart — no external charting dependency.
 *
 * @param {Array<{label: string, value: number, color: string}>} data
 * @param {number} size       diameter in px
 * @param {number} thickness  ring thickness in px
 * @param {string} centerPrimary    bold center text (e.g. a count)
 * @param {string} centerSecondary  small center caption
 * @param {boolean} showLegend
 */
const DonutChart = ({
  data = [],
  size = 168,
  thickness = 22,
  centerPrimary,
  centerSecondary,
  showLegend = true,
  disableTooltip = false,
}) => {
  const theme = useTheme();
  const segments = data.filter((d) => (d.value || 0) > 0);
  const total = segments.reduce((sum, d) => sum + (d.value || 0), 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let offset = 0;

  return (
    <Stack direction="row" alignItems="center" spacing={2.5} flexWrap="wrap" justifyContent="center">
      <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="donut chart">
          <g transform={`rotate(-90 ${center} ${center})`}>
            {total === 0 ? (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={theme.palette.divider}
                strokeWidth={thickness}
              />
            ) : (
              segments.map((seg) => {
                const length = (seg.value / total) * circumference;
                const pct = Math.round((seg.value / total) * 100);
                const circleEl = (
                  <circle
                    key={seg.label}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={thickness}
                    strokeDasharray={`${length} ${circumference - length}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="butt"
                    style={{ cursor: disableTooltip ? 'default' : 'pointer' }}
                  />
                );
                offset += length;
                return disableTooltip ? circleEl : (
                  <Tooltip
                    key={seg.label}
                    arrow
                    followCursor
                    title={`${seg.label}: ${seg.value} (${pct}%)`}
                  >
                    {circleEl}
                  </Tooltip>
                );
              })
            )}
          </g>
        </svg>

        {(centerPrimary !== undefined || centerSecondary !== undefined) && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              px: 1,
              pointerEvents: 'none', // let hover reach the donut segments underneath
            }}
          >
            {centerPrimary !== undefined && (
              <Typography sx={{ fontSize: 26, fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>
                {centerPrimary}
              </Typography>
            )}
            {centerSecondary !== undefined && (
              <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>
                {centerSecondary}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {showLegend && segments.length > 0 && (
        <Stack spacing={0.75} sx={{ minWidth: 110 }}>
          {data.map((seg) => (
            <Stack key={seg.label} direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: seg.color, flexShrink: 0 }} />
              <Typography sx={{ fontSize: 12.5, color: 'text.primary', flex: 1 }}>{seg.label}</Typography>
              <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'text.primary' }}>{seg.value}</Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default DonutChart;
