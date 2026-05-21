import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon            from '@mui/icons-material/Close';
import EventOutlinedIcon    from '@mui/icons-material/EventOutlined';

import { createJob, updateJob, listRegions } from '../jobsStorage';
import { toLocalInputValue } from '../calendarUtils';

const FormRow = ({ label, required, alignTop, children }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: '140px 1fr',
      alignItems: alignTop ? 'flex-start' : 'center',
      gap: 2,
    }}
  >
    <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#374151', pt: alignTop ? 1 : 0 }}>
      {label}
      {required && <Box component="span" sx={{ color: 'error.main', ml: 0.3 }}>*</Box>}
    </Typography>
    <Box>{children}</Box>
  </Box>
);

const buildInitial = (presetDate, job) => {
  if (job) {
    return {
      title:       job.title || '',
      category:    job.category || 'work',
      location:    job.location || '',
      description: job.description || '',
      allDay:      !!job.allDay,
      start:       toLocalInputValue(job.start),
      end:         toLocalInputValue(job.end),
    };
  }
  const base = presetDate ? new Date(presetDate) : new Date();
  base.setMinutes(0, 0, 0);
  if (!presetDate) {
    base.setHours(base.getHours() + 1);
  } else if (base.getHours() === 0) {
    base.setHours(9);
  }
  const end = new Date(base);
  end.setHours(end.getHours() + 1);
  return {
    title: '',
    category: 'work',
    location: '',
    description: '',
    allDay: false,
    start: toLocalInputValue(base),
    end:   toLocalInputValue(end),
  };
};

const CreateJob = ({ open, onClose, onSaved, presetDate, job, categories = [] }) => {
  const editing = !!job;
  const [formData, setFormData] = useState(() => buildInitial(presetDate, job));
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]     = useState('');
  const [regions, setRegions]       = useState([]);

  useEffect(() => {
    if (open) {
      setFormData(buildInitial(presetDate, job));
      setErrors({});
      setApiError('');
    }
  }, [open, presetDate, job]);

  useEffect(() => {
    if (!open || regions.length) return;
    let cancelled = false;
    listRegions()
      .then(data => { if (!cancelled) setRegions(data); })
      .catch(() => { if (!cancelled) setRegions([]); });
    return () => { cancelled = true; };
  }, [open, regions.length]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.start)        errs.start = 'Start is required';
    if (!formData.end)          errs.end   = 'End is required';
    if (formData.start && formData.end && new Date(formData.end) < new Date(formData.start)) {
      errs.end = 'End must be after start';
    }
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setApiError('');
    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        location: formData.location.trim(),
        description: formData.description.trim(),
        allDay: formData.allDay,
        start: new Date(formData.start).toISOString(),
        end:   new Date(formData.end).toISOString(),
      };
      const saved = editing
        ? await updateJob(job.id, payload)
        : await createJob(payload);
      onSaved?.(saved);
      onClose?.();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to save job. Please try again.';
      setApiError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 520 } } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ px: 2.5, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
          <EventOutlinedIcon sx={{ color: '#1976d2' }} />
          <Typography sx={{ flex: 1, fontWeight: 700, fontSize: 16 }}>
            {editing ? 'Edit Job' : 'New Job'}
          </Typography>
          <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
        </Box>

        {/* Body */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {apiError && <Alert severity="error" sx={{ mb: 1 }}>{apiError}</Alert>}

          <FormRow label="Title" required>
            <TextField
              name="title"
              value={formData.title}
              onChange={handleChange}
              size="small"
              fullWidth
              placeholder="e.g. Server maintenance window"
              error={!!errors.title}
              helperText={errors.title}
            />
          </FormRow>

          <FormRow label="Category">
            <FormControl size="small" fullWidth>
              <Select
                name="category"
                value={categories.some(c => c.key === formData.category) ? formData.category : ''}
                onChange={handleChange}
                displayEmpty
              >
                {categories.length === 0 && (
                  <MenuItem value="" disabled>Loading…</MenuItem>
                )}
                {categories.map(c => (
                  <MenuItem key={c.key} value={c.key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c.color }} />
                      {c.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormRow>

          <FormRow label="All day">
            <FormControlLabel
              control={<Switch name="allDay" checked={formData.allDay} onChange={handleChange} size="small" />}
              label={<Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Spans the whole day</Typography>}
            />
          </FormRow>

          <FormRow label="Start" required>
            <TextField
              name="start"
              type="datetime-local"
              value={formData.start}
              onChange={handleChange}
              size="small"
              fullWidth
              error={!!errors.start}
              helperText={errors.start}
              InputLabelProps={{ shrink: true }}
            />
          </FormRow>

          <FormRow label="End" required>
            <TextField
              name="end"
              type="datetime-local"
              value={formData.end}
              onChange={handleChange}
              size="small"
              fullWidth
              error={!!errors.end}
              helperText={errors.end}
              InputLabelProps={{ shrink: true }}
            />
          </FormRow>

          <FormRow label="Location">
            <FormControl size="small" fullWidth>
              <Select
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="">
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                    {regions.length === 0 ? 'Loading regions…' : 'None'}
                  </Typography>
                </MenuItem>
                {regions.map(r => (
                  <MenuItem key={r.id} value={r.name}>{r.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormRow>

          <FormRow label="Description" alignTop>
            <TextField
              name="description"
              value={formData.description}
              onChange={handleChange}
              size="small"
              fullWidth
              multiline
              minRows={3}
              placeholder="Add notes…"
            />
            <FormHelperText sx={{ ml: 0 }}>Optional. Use for runbook links, owners, etc.</FormHelperText>
          </FormRow>
        </Box>

        <Divider />

        {/* Footer */}
        <Box sx={{ px: 2.5, py: 1.5, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onClose} variant="text" disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {editing ? 'Save changes' : 'Create job'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default CreateJob;
