import React, { useState } from 'react';
import api from '../../../services/api';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon            from '@mui/icons-material/Close';
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined';
import useDropdownOptions   from '../../../hooks/useDropdownOptions';


const INITIAL_FORM = { name: '', type: '', location: '', status: '', runtime_version: '' };

const FormRow = ({ label, required, alignTop, children }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: alignTop ? 'flex-start' : 'center', gap: 2 }}>
    <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary', pt: alignTop ? 1 : 0 }}>
      {label}
      {required && <Box component="span" sx={{ color: 'error.main', ml: 0.3 }}>*</Box>}
    </Typography>
    <Box>{children}</Box>
  </Box>
);

const CreateResource = ({ open, onClose, groupId, onCreated }) => {
  const [formData, setFormData]     = useState(INITIAL_FORM);
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]     = useState('');

  const { options: types,     loading: loadingTypes }    = useDropdownOptions('resource_type',   open);
  const { options: locations, loading: loadingLocs }     = useDropdownOptions('location',        open);
  const { options: statuses,  loading: loadingStatuses } = useDropdownOptions('resource_status', open);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name     = 'Name is required';
    if (!formData.type)        errs.type     = 'Type is required';
    if (!formData.location)    errs.location = 'Location is required';
    if (!formData.status)      errs.status   = 'Status is required';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setApiError('');
    try {
      const payload = { ...formData };
      if (payload.type !== 'Function App') delete payload.runtime_version;
      await api.post(`/recycle-bin/resource-groups/${groupId}/resources`, payload);
      setFormData(INITIAL_FORM);
      onCreated?.();
      onClose?.();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to create resource. Please try again.';
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
    <Drawer anchor="right" open={open} onClose={handleCancel}
      PaperProps={{ sx: { width: { xs: '100%', sm: 600 } } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 18, color: '#111827' }}>Create Resource</Typography>
          <IconButton size="small" onClick={handleCancel} sx={{ color: '#757575' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', px: 4, py: 4 }}>
          {apiError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }} onClose={() => setApiError('')}>
              {apiError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            <FormRow label="Name" required>
              <TextField fullWidth size="small" name="name" value={formData.name}
                onChange={handleChange} placeholder="Enter resource name"
                error={!!errors.name} helperText={errors.name} />
            </FormRow>

            <FormRow label="Type" required>
              <FormControl fullWidth size="small" error={!!errors.type}>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  displayEmpty
                  disabled={loadingTypes}
                >
                  <MenuItem value="" disabled>{loadingTypes ? 'Loading…' : 'Select type'}</MenuItem>
                  {types.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </FormRow>

            <FormRow label="Location" required>
              <FormControl fullWidth size="small" error={!!errors.location}>
                <Select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  displayEmpty
                  disabled={loadingLocs}
                >
                  <MenuItem value="" disabled>{loadingLocs ? 'Loading…' : 'Select location'}</MenuItem>
                  {locations.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                </Select>
              </FormControl>
            </FormRow>

            <FormRow label="Status" required>
              <FormControl fullWidth size="small" error={!!errors.status}>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  displayEmpty
                  disabled={loadingStatuses}
                >
                  <MenuItem value="" disabled>{loadingStatuses ? 'Loading…' : 'Select status'}</MenuItem>
                  {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </FormRow>

            {formData.type === 'Function App' && (
              <FormRow label="Runtime version">
                <TextField fullWidth size="small" name="runtime_version" value={formData.runtime_version}
                  onChange={handleChange} placeholder="e.g. 4.30.0.0" />
              </FormRow>
            )}
          </Box>
        </Box>

        <Divider />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2 }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button variant="outlined" onClick={handleCancel} disabled={submitting} sx={{ textTransform: 'none', minWidth: 80 }}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleSubmit} disabled={submitting}
              startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : null}
              sx={{ textTransform: 'none', minWidth: 80 }}>
              {submitting ? 'Creating…' : 'Create'}
            </Button>
          </Box>
          <Button variant="contained" color="primary" size="small" startIcon={<FeedbackOutlinedIcon />}
            onClick={() => alert('Thank you for your feedback!')}
            sx={{ textTransform: 'none', borderRadius: 2, px: 2 }}>
            Feedback
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default CreateResource;
