import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';

import { startOfWeek, addDays, isSameDay, formatTime, WEEKDAYS_SHORT } from './calendarUtils';
import { getCategoryColor } from './jobsStorage';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 44;

const formatHour = (h) => {
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
};

const WeekView = ({ anchorDate, jobs, onSlotClick, onEventClick }) => {
  const days  = useMemo(() => {
    const start = startOfWeek(anchorDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [anchorDate]);
  const today = useMemo(() => { const t = new Date(); t.setHours(0,0,0,0); return t; }, []);

  const eventsForDay = (day) =>
    jobs.filter(j => {
      const s = new Date(j.start);
      return isSameDay(s, day);
    });

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#fff', overflow: 'hidden' }}>
      {/* Day headers */}
      <Box sx={{ display: 'grid', gridTemplateColumns: `60px repeat(7, 1fr)`, borderBottom: '1px solid #e5e7eb' }}>
        <Box />
        {days.map((d) => {
          const isToday = isSameDay(d, today);
          return (
            <Box key={d.toISOString()} sx={{ textAlign: 'center', py: 1, borderLeft: '1px solid #f3f4f6' }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: 0.6, textTransform: 'uppercase' }}>
                {WEEKDAYS_SHORT[d.getDay()]}
              </Typography>
              <Typography sx={{
                fontSize: 18, fontWeight: 700,
                color: isToday ? '#fff' : '#111827',
                bgcolor: isToday ? '#1976d2' : 'transparent',
                width: 32, height: 32, lineHeight: '32px',
                borderRadius: '50%', mx: 'auto', mt: 0.25,
              }}>
                {d.getDate()}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Scrollable hour grid */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: `60px repeat(7, 1fr)`, position: 'relative' }}>
          {/* Hours column */}
          <Box>
            {HOURS.map((h) => (
              <Box key={h} sx={{ height: HOUR_HEIGHT, borderBottom: '1px solid #f3f4f6', pr: 1, textAlign: 'right' }}>
                <Typography sx={{ fontSize: 10, color: '#9ca3af', mt: -0.5 }}>{formatHour(h)}</Typography>
              </Box>
            ))}
          </Box>

          {/* Day columns */}
          {days.map((day) => (
            <Box key={day.toISOString()} sx={{ position: 'relative', borderLeft: '1px solid #f3f4f6' }}>
              {HOURS.map((h) => (
                <Box
                  key={h}
                  onClick={() => {
                    const slot = new Date(day);
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

              {/* Events */}
              {eventsForDay(day).map((ev) => {
                const s = new Date(ev.start);
                const e = new Date(ev.end);
                const startMin = s.getHours() * 60 + s.getMinutes();
                const endMin   = isSameDay(s, e) ? (e.getHours() * 60 + e.getMinutes()) : 24 * 60;
                const top    = (startMin / 60) * HOUR_HEIGHT;
                const height = Math.max(22, ((endMin - startMin) / 60) * HOUR_HEIGHT - 2);
                const color  = getCategoryColor(ev.category);

                return (
                  <Box
                    key={ev.id}
                    onClick={(evt) => { evt.stopPropagation(); onEventClick?.(ev, evt.currentTarget); }}
                    sx={{
                      position: 'absolute',
                      top, height,
                      left: 4, right: 4,
                      borderRadius: 0.75,
                      bgcolor: `${color}1f`,
                      borderLeft: `3px solid ${color}`,
                      px: 0.75, py: 0.5,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      '&:hover': { bgcolor: `${color}33` },
                    }}
                  >
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color, lineHeight: 1.2 }}>
                      {ev.title}
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: '#374151', lineHeight: 1.2 }}>
                      {formatTime(s)} – {formatTime(e)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default WeekView;
