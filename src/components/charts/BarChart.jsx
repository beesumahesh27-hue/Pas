import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';

/**
 * Reusable SVG vertical bar chart — no external charting dependency.
 *
 * @param {Array<{label: string, value: number, color: string}>} data
 * @param {number} height   chart area height in px (excludes axis labels)
 * @param {string} unit     optional unit suffix shown on value labels
 */
const BarChart = ({ data = [], height = 200, unit = '' }) => {
  const max = Math.max(1, ...data.map((d) => d.value || 0));
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
  const ticks = 4;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex' }}>
        {/* Y axis tick labels */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height,
            pr: 1,
            py: 0,
          }}
        >
          {Array.from({ length: ticks + 1 }).map((_, i) => (
            <Typography key={i} sx={{ fontSize: 10, color: 'text.secondary', lineHeight: 1 }}>
              {Math.round((max * (ticks - i)) / ticks)}
            </Typography>
          ))}
        </Box>

        {/* Plot area */}
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              position: 'relative',
              height,
              borderLeft: '1px solid',
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              px: 1,
            }}
          >
            {/* gridlines */}
            {Array.from({ length: ticks }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: `${((i + 1) / ticks) * 100}%`,
                  borderTop: '1px dashed',
                  borderColor: 'divider',
                  opacity: 0.5,
                }}
              />
            ))}

            {data.length === 0 ? (
              <Typography sx={{ fontSize: 12, color: 'text.secondary', alignSelf: 'center' }}>
                No data
              </Typography>
            ) : (
              data.map((d) => (
                <Box
                  key={d.label}
                  sx={{
                    flex: 1,
                    mx: 0.75,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    height: '100%',
                    zIndex: 1,
                  }}
                >
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.primary', mb: 0.25 }}>
                    {d.value}
                    {unit}
                  </Typography>
                  <Tooltip
                    arrow
                    followCursor
                    title={`${d.label}: ${d.value}${unit} (${total ? Math.round((d.value / total) * 100) : 0}%)`}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        maxWidth: 46,
                        height: `${(d.value / max) * 100}%`,
                        minHeight: d.value > 0 ? 4 : 0,
                        bgcolor: d.color,
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease',
                        cursor: 'pointer',
                      }}
                    />
                  </Tooltip>
                </Box>
              ))
            )}
          </Box>

          {/* X axis labels */}
          <Box sx={{ display: 'flex', justifyContent: 'space-around', px: 1, mt: 0.5 }}>
            {data.map((d) => (
              <Typography
                key={d.label}
                sx={{
                  flex: 1,
                  mx: 0.75,
                  fontSize: 11,
                  color: 'text.secondary',
                  textAlign: 'center',
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
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

export default BarChart;
