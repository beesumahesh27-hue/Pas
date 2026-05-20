import React, { useMemo } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';

import { buildMonthGrid, WEEKDAYS_SHORT, isSameDay, formatTime } from './calendarUtils';
import { getCategoryColor } from './jobsStorage';

const MAX_VISIBLE = 3;

const eventsForDay = (jobs, day) =>
  jobs.filter(j => {
    const s = new Date(j.start);
    const e = new Date(j.end);
    return day >= new Date(s.getFullYear(), s.getMonth(), s.getDate()) &&
           day <= new Date(e.getFullYear(), e.getMonth(), e.getDate());
  });

const MonthView = ({ anchorDate, jobs, onDayClick, onEventClick }) => {
  const grid  = useMemo(() => buildMonthGrid(anchorDate), [anchorDate]);
  const today = useMemo(() => { const t = new Date(); t.setHours(0,0,0,0); return t; }, []);
  const activeMonth = anchorDate.getMonth();

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#fff', overflow: 'hidden' }}>
      {/* Weekday header */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #e5e7eb' }}>
        {WEEKDAYS_SHORT.map((w) => (
          <Box key={w} sx={{ px: 1, py: 1, textAlign: 'center', borderRight: '1px solid #f3f4f6' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: 0.6, textTransform: 'uppercase' }}>
              {w}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Grid */}
      <Box sx={{ flex: 1, display: 'grid', gridTemplateRows: 'repeat(6, 1fr)' }}>
        {grid.map((week, wi) => (
          <Box key={wi} sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: wi < 5 ? '1px solid #f3f4f6' : 'none' }}>
            {week.map((day) => {
              const isToday   = isSameDay(day, today);
              const inMonth   = day.getMonth() === activeMonth;
              const dayEvents = eventsForDay(jobs, day);
              const visible   = dayEvents.slice(0, MAX_VISIBLE);
              const overflow  = dayEvents.length - visible.length;

              return (
                <Box
                  key={day.toISOString()}
                  onClick={() => onDayClick?.(day)}
                  sx={{
                    borderRight: '1px solid #f3f4f6',
                    p: 0.75,
                    cursor: 'pointer',
                    bgcolor: isToday ? '#eff6ff' : '#fff',
                    opacity: inMonth ? 1 : 0.45,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.25,
                    overflow: 'hidden',
                    transition: 'background 0.15s',
                    '&:hover': { bgcolor: isToday ? '#dbeafe' : '#f9fafb' },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Box
                      sx={{
                        width: 22, height: 22,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '50%',
                        bgcolor: isToday ? '#1976d2' : 'transparent',
                        color: isToday ? '#fff' : (inMonth ? '#111827' : '#9ca3af'),
                        fontSize: 12, fontWeight: isToday ? 700 : 500,
                      }}
                    >
                      {day.getDate()}
                    </Box>
                  </Box>

                  {visible.map((ev) => {
                    const color = getCategoryColor(ev.category);
                    return (
                      <Tooltip key={ev.id} title={`${ev.title} • ${ev.allDay ? 'All day' : formatTime(ev.start)}`} arrow>
                        <Box
                          onClick={(e) => { e.stopPropagation(); onEventClick?.(ev, e.currentTarget); }}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: 0.5,
                            px: 0.75, py: 0.25, borderRadius: 0.75,
                            bgcolor: `${color}1f`,
                            borderLeft: `3px solid ${color}`,
                            cursor: 'pointer',
                            overflow: 'hidden',
                            '&:hover': { bgcolor: `${color}33` },
                          }}
                        >
                          {!ev.allDay && (
                            <Typography sx={{ fontSize: 10, fontWeight: 700, color, flexShrink: 0 }}>
                              {formatTime(ev.start).replace(' ', '')}
                            </Typography>
                          )}
                          <Typography sx={{ fontSize: 11, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {ev.title}
                          </Typography>
                        </Box>
                      </Tooltip>
                    );
                  })}

                  {overflow > 0 && (
                    <Typography sx={{ fontSize: 10, color: '#6b7280', pl: 0.75, fontWeight: 600 }}>
                      +{overflow} more
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default MonthView;
