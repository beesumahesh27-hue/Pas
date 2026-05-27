import React from 'react';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import hexToRgba from './hexToRgba';

/**
 * White titled card used to frame a chart. Matches the app's card styling
 * (outlined, #e8e8e8 border) used across StatCard and the Dashboard.
 * Hover lifts the card and tints the border/glow with `accent` (the icon colour).
 */
const ChartCard = ({ title, subtitle, icon, action, accent = '#1976d2', children }) => (
  <Card
    variant="outlined"
    sx={{
      height: '100%',
      borderColor: 'divider',
      borderRadius: 2,
      transition: 'all 0.18s',
      '&:hover': {
        boxShadow: `0 8px 24px ${hexToRgba(accent, 0.3)}`,
        transform: 'translateY(-2px)',
        borderColor: accent,
      },
    }}
  >
    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {icon && (
            <Box sx={{ display: 'flex', alignItems: 'center', color: accent }}>{icon}</Box>
          )}
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        {action}
      </Stack>
      {children}
    </CardContent>
  </Card>
);

export default ChartCard;
