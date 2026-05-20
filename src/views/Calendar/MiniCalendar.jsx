import React, { useMemo, useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ChevronLeftIcon  from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { buildMonthGrid, MONTHS, WEEKDAYS_SHORT, addMonths, isSameDay } from './calendarUtils';

const MiniCalendar = ({ selectedDate, onSelect }) => {
  const [anchor, setAnchor] = useState(selectedDate);
  const grid  = useMemo(() => buildMonthGrid(anchor), [anchor]);
  const today = useMemo(() => { const t = new Date(); t.setHours(0,0,0,0); return t; }, []);
  const activeMonth = anchor.getMonth();

  return (
    <Box sx={{ p: 1.5, borderBottom: '1px solid #f0f0f0' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
        <Typography sx={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#111827' }}>
          {MONTHS[anchor.getMonth()]} {anchor.getFullYear()}
        </Typography>
        <IconButton size="small" onClick={() => setAnchor(addMonths(anchor, -1))}>
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => setAnchor(addMonths(anchor, 1))}>
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.25, mb: 0.5 }}>
        {WEEKDAYS_SHORT.map((w) => (
          <Typography key={w} sx={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textAlign: 'center' }}>
            {w[0]}
          </Typography>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.25 }}>
        {grid.flat().map((d) => {
          const isToday    = isSameDay(d, today);
          const isSelected = isSameDay(d, selectedDate);
          const inMonth    = d.getMonth() === activeMonth;
          return (
            <Box
              key={d.toISOString()}
              onClick={() => onSelect?.(d)}
              sx={{
                height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, cursor: 'pointer', borderRadius: '50%',
                color: isSelected ? '#fff' : isToday ? '#1976d2' : inMonth ? '#111827' : '#cbd5e1',
                bgcolor: isSelected ? '#1976d2' : 'transparent',
                fontWeight: isSelected || isToday ? 700 : 400,
                '&:hover': { bgcolor: isSelected ? '#1565c0' : '#eff6ff' },
              }}
            >
              {d.getDate()}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default MiniCalendar;
