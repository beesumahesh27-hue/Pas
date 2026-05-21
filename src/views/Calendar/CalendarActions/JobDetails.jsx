import React from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Popover,
  Typography,
} from '@mui/material';
import CloseIcon            from '@mui/icons-material/Close';
import EditOutlinedIcon     from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon    from '@mui/icons-material/DeleteOutline';
import AccessTimeOutlinedIcon  from '@mui/icons-material/AccessTimeOutlined';
import LocationOnOutlinedIcon  from '@mui/icons-material/LocationOnOutlined';
import NotesOutlinedIcon       from '@mui/icons-material/NotesOutlined';

import { getCategoryColor, getCategoryLabel } from '../jobsStorage';
import { formatTime, MONTHS, isSameDay } from '../calendarUtils';

const formatRange = (job) => {
  const s = new Date(job.start);
  const e = new Date(job.end);
  const dayLabel = (d) => `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
  if (job.allDay) {
    return isSameDay(s, e) ? `${dayLabel(s)} • All day` : `${dayLabel(s)} – ${dayLabel(e)} • All day`;
  }
  if (isSameDay(s, e)) {
    return `${dayLabel(s)} • ${formatTime(s)} – ${formatTime(e)}`;
  }
  return `${dayLabel(s)} ${formatTime(s)} – ${dayLabel(e)} ${formatTime(e)}`;
};

const JobDetails = ({ anchorEl, job, onClose, onEdit, onDelete, categories = [] }) => {
  if (!job) return null;
  const matched = categories.find(c => c.key === job.category);
  const color = matched?.color || getCategoryColor(job.category);
  const categoryLabel = matched?.label || getCategoryLabel(job.category);

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      PaperProps={{ sx: { width: 340, borderRadius: 1.5, boxShadow: '0 6px 24px rgba(0,0,0,0.15)' } }}
    >
      {/* Color strip + header */}
      <Box sx={{ height: 4, bgcolor: color }} />
      <Box sx={{ px: 2, pt: 1.5, pb: 1, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>{job.title}</Typography>
          <Chip
            label={categoryLabel}
            size="small"
            sx={{ mt: 0.5, height: 20, fontSize: 11, bgcolor: `${color}22`, color, fontWeight: 600 }}
          />
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </Box>

      <Divider />

      <Box sx={{ px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography sx={{ fontSize: 13 }}>{formatRange(job)}</Typography>
        </Box>
        {job.location && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography sx={{ fontSize: 13 }}>{job.location}</Typography>
          </Box>
        )}
        {job.description && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <NotesOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.25 }} />
            <Typography sx={{ fontSize: 13, color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
              {job.description}
            </Typography>
          </Box>
        )}
      </Box>

      <Divider />

      <Box sx={{ px: 1, py: 0.75, display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
        <Button size="small" startIcon={<DeleteOutlineIcon />} color="error" onClick={() => onDelete?.(job)}>
          Delete
        </Button>
        <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => onEdit?.(job)} variant="contained">
          Edit
        </Button>
      </Box>
    </Popover>
  );
};

export default JobDetails;
