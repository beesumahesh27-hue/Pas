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


const INITIAL_FORM = { name: '', subscription: '', location: '' };

const FormRow = ({ label, required, children }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 2 }}>
    <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary' }}>
      {label}
      {required && <Box component="span" sx={{ color: 'error.main', ml: 0.3 }}>*</Box>}
    </Typography>
    <Box>{children}</Box>
  </Box>
);

const CreateResourceGroup = ({ open, onClose, onCreated }) => {
  const [formData, setFormData]     = useState(INITIAL_FORM);
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]     = useState('');

  const { options: subscriptions, loading: loadingSubs } = useDropdownOptions('subscription', open);
  const { options: locations,     loading: loadingLocs } = useDropdownOptions('location', open);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim())  errs.name         = 'Resource group name is required';
    if (!formData.subscription) errs.subscription = 'Subscription is required';
    if (!formData.location)     errs.location     = 'Location is required';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setApiError('');
    try {
      const { data } = await api.post('/recycle-bin/resource-groups', formData);
      setFormData(INITIAL_FORM);
      onCreated?.(data);
      onClose?.();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to create resource group. Please try again.';
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
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 18, color: '#111827' }}>
            Create Resource Group
          </Typography>
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
                onChange={handleChange} placeholder="Enter resource group name"
                error={!!errors.name} helperText={errors.name} />
            </FormRow>

            <FormRow label="Subscription" required>
              <FormControl fullWidth size="small" error={!!errors.subscription}>
                <Select
                  name="subscription"
                  value={formData.subscription}
                  onChange={handleChange}
                  displayEmpty
                  disabled={loadingSubs}
                >
                  <MenuItem value="" disabled>{loadingSubs ? 'Loading…' : 'Select subscription'}</MenuItem>
                  {subscriptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
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

export default CreateResourceGroup;
