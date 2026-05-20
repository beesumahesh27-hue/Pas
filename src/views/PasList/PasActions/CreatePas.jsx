import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  FormControl,
  FormHelperText,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon              from '@mui/icons-material/Close';
import FeedbackOutlinedIcon   from '@mui/icons-material/FeedbackOutlined';



const INITIAL_FORM = { pas_name: '', description: '', region: '', status: '', type: '', cpu: '', users: 0 };

const FormRow = ({ label, required, alignTop, children }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: '160px 1fr',
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

const CreatePas = ({ open, onClose, onCreated }) => {
  const [formData, setFormData]           = useState(INITIAL_FORM);
  const [errors, setErrors]               = useState({});
  const [submitting, setSubmitting]       = useState(false);
  const [apiError, setApiError]           = useState('');
  const [regions, setRegions]             = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [typeOptions, setTypeOptions]     = useState([]);

  useEffect(() => {
    if (!open) return;
    api.get('/regions/').then(({ data }) => setRegions(data.map(r => r.name))).catch(() => {});
    api.get('/options/statuses').then(({ data }) => setStatusOptions(data.map(s => s.name))).catch(() => {});
    api.get('/options/types').then(({ data }) => setTypeOptions(data.map(t => t.name))).catch(() => {});
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.pas_name.trim())    errs.pas_name    = 'Platform name is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.region)             errs.region      = 'Region is required';
    if (!formData.status)             errs.status      = 'Status is required';
    if (!formData.type)               errs.type        = 'Type is required';
    if (!formData.cpu)                errs.cpu         = 'CPU Cores is required';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setApiError('');
    try {
      const payload = { ...formData, cpu: parseInt(formData.cpu, 10), users: parseInt(formData.users, 10) || 0 };
      await api.post('/platforms/', payload);
      setFormData(INITIAL_FORM);
      onCreated?.();
      onClose?.();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to create platform. Please try again.';
      setApiError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setApiError('');
    onClose?.();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleCancel}
      PaperProps={{ sx: { width: { xs: '100%', sm: 680 } } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2,
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 18, color: '#111827' }}>
            Create Platform
          </Typography>
          <IconButton size="small" onClick={handleCancel} sx={{ color: '#757575' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Body */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 4, py: 4 }}>
          {apiError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }} onClose={() => setApiError('')}>
              {apiError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>

            {/* Platform Name */}
            <FormRow label="Platform Name" required>
              <TextField
                fullWidth
                name="pas_name"
                value={formData.pas_name}
                onChange={handleChange}
                placeholder="Enter Platform Name"
                error={!!errors.pas_name}
                helperText={errors.pas_name}
                size="small"
              />
            </FormRow>

            {/* Description */}
            <FormRow label="Description" required alignTop>
              <TextField
                fullWidth
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter Description"
                multiline
                rows={3}
                error={!!errors.description}
                helperText={errors.description}
                size="small"
              />
            </FormRow>

            {/* Region */}
            <FormRow label="Region" required>
              <FormControl fullWidth size="small" error={!!errors.region}>
                <Select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  displayEmpty
                  renderValue={(v) =>
                    v || <Box component="span" sx={{ color: '#9ca3af' }}>Select Region</Box>
                  }
                >
                  {regions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                </Select>
                {errors.region && <FormHelperText>{errors.region}</FormHelperText>}
              </FormControl>
            </FormRow>

            {/* Status */}
            <FormRow label="Status" required>
              <FormControl fullWidth size="small" error={!!errors.status}>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  displayEmpty
                  renderValue={(v) =>
                    v || <Box component="span" sx={{ color: '#9ca3af' }}>Select Status</Box>
                  }
                >
                  {statusOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
                {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
              </FormControl>
            </FormRow>

            {/* Type */}
            <FormRow label="Type" required>
              <FormControl fullWidth size="small" error={!!errors.type}>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  displayEmpty
                  renderValue={(v) =>
                    v || <Box component="span" sx={{ color: '#9ca3af' }}>Select Type</Box>
                  }
                >
                  {typeOptions.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
              </FormControl>
            </FormRow>

            {/* CPU Cores */}
            <FormRow label="CPU Cores" required>
              <TextField
                fullWidth
                name="cpu"
                type="number"
                value={formData.cpu}
                onChange={handleChange}
                placeholder="Enter CPU Cores"
                error={!!errors.cpu}
                helperText={errors.cpu}
                size="small"
                inputProps={{ min: 1, max: 128, step: 1 }}
                sx={{
                  '& input[type=number]::-webkit-inner-spin-button': { opacity: 1 },
                  '& input[type=number]::-webkit-outer-spin-button': { opacity: 1 },
                }}
              />
            </FormRow>

            {/* Active Users */}
            <FormRow label="Active Users">
              <TextField
                fullWidth
                name="users"
                type="number"
                value={formData.users}
                onChange={handleChange}
                placeholder="Enter number of users"
                size="small"
                inputProps={{ min: 0, step: 1 }}
                sx={{
                  '& input[type=number]::-webkit-inner-spin-button': { opacity: 1 },
                  '& input[type=number]::-webkit-outer-spin-button': { opacity: 1 },
                }}
              />
            </FormRow>

          </Box>
        </Box>

        {/* Footer */}
        <Divider />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2 }}>
          {/* Cancel + Create — left side */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button variant="outlined" onClick={handleCancel} disabled={submitting} sx={{ textTransform: 'none', minWidth: 80 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : null}
              sx={{ textTransform: 'none', minWidth: 80 }}
            >
              {submitting ? 'Creating…' : 'Create'}
            </Button>
          </Box>

          {/* Feedback — right side */}
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<FeedbackOutlinedIcon />}
            onClick={() => alert('Thank you for your feedback!')}
            sx={{ textTransform: 'none', borderRadius: 2, px: 2 }}
          >
            Feedback
          </Button>
        </Box>

      </Box>
    </Drawer>
  );
};

export default CreatePas;
