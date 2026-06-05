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


const INITIAL_FORM = { name: '', trigger: '', language: '', status: '', description: '' };

const FormRow = ({ label, required, alignTop, children }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: alignTop ? 'flex-start' : 'center', gap: 2 }}>
    <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary', pt: alignTop ? 1 : 0 }}>
      {label}
      {required && <Box component="span" sx={{ color: 'error.main', ml: 0.3 }}>*</Box>}
    </Typography>
    <Box>{children}</Box>
  </Box>
);

const CreateFunction = ({ open, onClose, resourceId, onCreated }) => {
  const [formData, setFormData]     = useState(INITIAL_FORM);
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]     = useState('');

  const { options: triggers,  loading: loadingTriggers  } = useDropdownOptions('function_trigger',  open);
  const { options: languages, loading: loadingLanguages } = useDropdownOptions('function_language', open);
  const { options: statuses,  loading: loadingStatuses  } = useDropdownOptions('function_status',   open);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name    = 'Function name is required';
    if (!formData.trigger)     errs.trigger = 'Trigger is required';
    if (!formData.language)    errs.language = 'Language is required';
    if (!formData.status)      errs.status  = 'Status is required';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setApiError('');
    try {
      await api.post(`/recycle-bin/resources/${resourceId}/functions`, formData);
      setFormData(INITIAL_FORM);
      onCreated?.();
      onClose?.();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to create function. Please try again.';
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
      PaperProps={{ sx: { width: { xs: '100%', sm: 640 } } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 18, color: '#111827' }}>Create function</Typography>
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
            <FormRow label="Function name" required>
              <TextField fullWidth size="small" name="name" value={formData.name}
                onChange={handleChange} placeholder="Enter function name"
                error={!!errors.name} helperText={errors.name} />
            </FormRow>

            <FormRow label="Trigger" required>
              <FormControl fullWidth size="small" error={!!errors.trigger}>
                <Select
                  name="trigger"
                  value={formData.trigger}
                  onChange={handleChange}
                  displayEmpty
                  disabled={loadingTriggers}
                >
                  <MenuItem value="" disabled>{loadingTriggers ? 'Loading…' : 'Select trigger'}</MenuItem>
                  {triggers.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </FormRow>

            <FormRow label="Language" required>
              <FormControl fullWidth size="small" error={!!errors.language}>
                <Select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  displayEmpty
                  disabled={loadingLanguages}
                >
                  <MenuItem value="" disabled>{loadingLanguages ? 'Loading…' : 'Select language'}</MenuItem>
                  {languages.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
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

            <FormRow label="Description" alignTop>
              <TextField fullWidth size="small" name="description" value={formData.description}
                onChange={handleChange} placeholder="Describe what this function does"
                multiline rows={3} />
            </FormRow>
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

export default CreateFunction;
