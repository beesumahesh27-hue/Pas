import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';

import { isSameDay, formatTime } from './calendarUtils';
import { getCategoryColor } from './jobsStorage';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 52;

const formatHour = (h) => {
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
};

const DayView = ({ anchorDate, jobs, onSlotClick, onEventClick }) => {
  const dayEvents = useMemo(
    () => jobs.filter(j => isSameDay(new Date(j.start), anchorDate)),
    [jobs, anchorDate],
  );

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#fff', overflow: 'hidden' }}>
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '80px 1fr', position: 'relative' }}>
          {/* Hours */}
          <Box>
            {HOURS.map((h) => (
              <Box key={h} sx={{ height: HOUR_HEIGHT, borderBottom: '1px solid #f3f4f6', pr: 1, textAlign: 'right' }}>
                <Typography sx={{ fontSize: 11, color: '#9ca3af', mt: -0.5 }}>{formatHour(h)}</Typography>
              </Box>
            ))}
          </Box>

          {/* Slots */}
          <Box sx={{ position: 'relative', borderLeft: '1px solid #f3f4f6' }}>
            {HOURS.map((h) => (
              <Box
                key={h}
                onClick={() => {
                  const slot = new Date(anchorDate);
                  slot.setHours(h, 0, 0, 0);
                  onSlotClick?.(slot);
                }}
                sx={{
                  height: HOUR_HEIGHT,
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#f9fafb' },
                }}
              />
            ))}

            {dayEvents.map((ev) => {
              const s = new Date(ev.start);
              const e = new Date(ev.end);
              const startMin = s.getHours() * 60 + s.getMinutes();
              const endMin   = isSameDay(s, e) ? (e.getHours() * 60 + e.getMinutes()) : 24 * 60;
              const top    = (startMin / 60) * HOUR_HEIGHT;
              const height = Math.max(28, ((endMin - startMin) / 60) * HOUR_HEIGHT - 2);
              const color  = getCategoryColor(ev.category);

              return (
                <Box
                  key={ev.id}
                  onClick={(evt) => { evt.stopPropagation(); onEventClick?.(ev, evt.currentTarget); }}
                  sx={{
                    position: 'absolute',
                    top, height,
                    left: 8, right: 8,
                    borderRadius: 1,
                    bgcolor: `${color}1f`,
                    borderLeft: `4px solid ${color}`,
                    px: 1.25, py: 0.75,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    '&:hover': { bgcolor: `${color}33` },
                  }}
                >
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.2 }}>
                    {ev.title}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: '#374151', lineHeight: 1.2, mt: 0.25 }}>
                    {formatTime(s)} – {formatTime(e)}
                  </Typography>
                  {ev.location && (
                    <Typography sx={{ fontSize: 11, color: '#6b7280', lineHeight: 1.2 }}>
                      {ev.location}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DayView;
