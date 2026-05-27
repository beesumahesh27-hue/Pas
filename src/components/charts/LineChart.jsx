import React from 'react';
import { Box, Tooltip, Typography, useTheme } from '@mui/material';

/**
 * Reusable SVG line/area chart — no external charting dependency.
 * Renders responsively (preserveAspectRatio="none" + non-scaling stroke).
 *
 * @param {Array<{label: string, value: number}>} data
 * @param {number} height  plot height in px
 * @param {string} color   line/area colour
 */
const LineChart = ({ data = [], height = 200, color = '#1976d2' }) => {
  const theme = useTheme();
  const n = data.length;
  const max = Math.max(1, ...data.map((d) => d.value || 0));
  const ticks = 4;

  const VW = 100;            // viewBox width units (stretched to container)
  const top = 6;
  const bottom = height - 6;
  const xAt = (i) => (n <= 1 ? VW / 2 : (i / (n - 1)) * VW);
  const yAt = (v) => bottom - (v / max) * (bottom - top);

  const linePoints = data.map((d, i) => `${xAt(i)},${yAt(d.value || 0)}`).join(' ');
  const areaPoints = n ? `${xAt(0)},${bottom} ${linePoints} ${xAt(n - 1)},${bottom}` : '';

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex' }}>
        {/* Y axis ticks */}
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height, pr: 1 }}>
          {Array.from({ length: ticks + 1 }).map((_, i) => (
            <Typography key={i} sx={{ fontSize: 10, color: 'text.secondary', lineHeight: 1 }}>
              {Math.round((max * (ticks - i)) / ticks)}
            </Typography>
          ))}
        </Box>

        {/* Plot area */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              position: 'relative',
              height,
              borderLeft: '1px solid',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            {/* gridlines */}
            {Array.from({ length: ticks }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute', left: 0, right: 0,
                  bottom: `${((i + 1) / ticks) * 100}%`,
                  borderTop: '1px dashed', borderColor: 'divider', opacity: 0.5,
                }}
              />
            ))}

            {n === 0 ? (
              <Typography
                sx={{
                  position: 'absolute', inset: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, color: 'text.secondary',
                }}
              >
                No data
              </Typography>
            ) : (
              <svg
                width="100%"
                height={height}
                viewBox={`0 0 ${VW} ${height}`}
                preserveAspectRatio="none"
                style={{ display: 'block' }}
                role="img"
                aria-label="line chart"
              >
                {areaPoints && <polygon points={areaPoints} fill={color} opacity={theme.palette.mode === 'dark' ? 0.22 : 0.12} />}
                <polyline
                  points={linePoints}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            )}

            {/* Hoverable point markers with tooltips (day → value) */}
            {n > 0 && data.map((d, i) => (
              <Tooltip
                key={`pt-${d.label}-${i}`}
                arrow
                followCursor
                title={`${d.label}: ${d.value || 0} (${Math.round(((d.value || 0) / max) * 100)}%)`}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: `${n <= 1 ? 50 : (i / (n - 1)) * 100}%`,
                    top: yAt(d.value || 0),
                    width: 10,
                    height: 10,
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '50%',
                    bgcolor: color,
                    border: '2px solid',
                    borderColor: 'background.paper',
                    cursor: 'pointer',
                    zIndex: 2,
                  }}
                />
              </Tooltip>
            ))}
          </Box>

          {/* X axis labels (day unit) */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            {data.map((d, i) => (
              <Typography
                key={`${d.label}-${i}`}
                sx={{ flex: 1, fontSize: 10, color: 'text.secondary', textAlign: 'center', whiteSpace: 'nowrap' }}
              >
                {d.label}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LineChart;
