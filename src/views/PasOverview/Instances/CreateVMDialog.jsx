import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon         from '@mui/icons-material/ArrowBack';
import InfoOutlinedIcon      from '@mui/icons-material/InfoOutlined';
import AddIcon               from '@mui/icons-material/Add';
import CloseIcon             from '@mui/icons-material/Close';
import ComputerOutlinedIcon  from '@mui/icons-material/ComputerOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined';

const TABS = ['Basics', 'Networking', 'Advanced', 'Review + Create'];

const TAB_DESCRIPTIONS = {
  0: 'Create a compliance policy by selecting a predefined template or configuring a custom one. Provide essential details such as name, region, and resource group.',
  2: 'Customize your compliance policy by adding additional configurations, tags, script settings, and cloud recipes.',
  3: 'Review the summary of your compliance policy setup. Modify any section if needed, or proceed with creation.',
};


const DonutChart = ({ used, free, label }) => {
  const total = used + free;
  const pct   = total === 0 ? 0 : Math.round((used / total) * 100);
  const r     = 53;
  const cx = 65; const cy = 65;
  const circ  = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <svg width={130} height={130}>
        <circle cx={cx} cy={cy} r={r} stroke="#e0e0e0" strokeWidth={14} fill="none" />
        {pct > 0 && (
          <circle cx={cx} cy={cy} r={r} stroke="#1976d2" strokeWidth={14} fill="none"
            strokeDasharray={`${circ} ${circ}`} strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="round" />
        )}
        <text x={cx} y={cy - 8}  textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#666">{label}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="middle" fontSize="15" fontWeight="600" fill="#333">{pct}%</text>
      </svg>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignSelf: 'flex-start', pl: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#1976d2' }} />
          <Typography variant="caption" color="text.secondary">Used {used}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#e0e0e0' }} />
          <Typography variant="caption" color="text.secondary">Free {free}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

const FieldRow = ({ label, required, tooltip, children }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'flex-start', gap: 2, mb: 2.5 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pt: 1 }}>
      <Typography variant="body2" sx={{ fontSize: 13 }}>
        {label}{required && <Box component="span" sx={{ color: '#e53935' }}> *</Box>}
      </Typography>
      {tooltip && (
        <Tooltip title={tooltip} arrow>
          <InfoOutlinedIcon sx={{ fontSize: 15, color: 'text.disabled', cursor: 'pointer' }} />
        </Tooltip>
      )}
    </Box>
    {children}
  </Box>
);

const INITIAL = { name: '', additionalName: '', vmCount: 1, schedule: '', template: '', existingTags: '', newTag: '', region: '', pod: '' };

const CreateVMDialog = ({ onClose, onCreated }) => {
  const [activeTab, setActiveTab]       = useState(0);
  const [formData, setFormData]         = useState(INITIAL);
  const [tags, setTags]                 = useState([]);
  const [errors, setErrors]             = useState({});
  const [submitting, setSubmitting]     = useState(false);
  const [apiError, setApiError]         = useState('');
  const [regions, setRegions]                   = useState([]);
  const [pods, setPods]                         = useState([]);
  const [templateOptions, setTemplateOptions]   = useState([]);
  const [existingTagOptions, setExistingTagOptions] = useState([]);

  useEffect(() => {
    api.get('/compliance/regions').then(({ data }) => setRegions(data.map(r => r.name))).catch(() => {});
    api.get('/compliance/pods').then(({ data }) => setPods(data.map(p => p.name))).catch(() => {});
    api.get('/compliance/templates').then(({ data }) => setTemplateOptions(data.map(t => t.name))).catch(() => {});
    api.get('/compliance/tags').then(({ data }) => setExistingTagOptions(data.map(t => t.name))).catch(() => {});
  }, []);

  const hasBasicsError = !formData.name || !formData.schedule || !formData.template;

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (apiError) setApiError('');
  };

  const handleAddTag = () => {
    if (formData.newTag.trim()) {
      setTags(prev => [...prev, formData.newTag.trim()]);
      setFormData(prev => ({ ...prev, newTag: '' }));
    }
  };

  const handleNext = () => { if (activeTab < TABS.length - 1) setActiveTab(p => p + 1); };
  const handlePrev = () => { if (activeTab > 0) setActiveTab(p => p - 1); };

  const handleCreate = async () => {
    const errs = {};
    if (!formData.name)     errs.name     = 'Name is required';
    if (!formData.schedule) errs.schedule = 'Schedule is required';
    if (!formData.template) errs.template = 'Template is required';
    if (Object.keys(errs).length) { setErrors(errs); setActiveTab(0); return; }

    setSubmitting(true);
    setApiError('');
    try {
      await api.post('/vms/', {
        vm_name:         formData.name,
        additional_name: formData.additionalName || null,
        vm_count:        parseInt(formData.vmCount) || 1,
        schedule:        formData.schedule || null,
        template:        formData.template,
        region:          formData.region || null,
        cloud_pod:       formData.pod || 'Default_POD',
        tags:            tags.join(',') || null,
        power_state:     'Halted',
      });
      setFormData(INITIAL); setTags([]); setErrors({}); setActiveTab(0);
      onCreated?.(); onClose?.();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to create. Please try again.';
      setApiError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(INITIAL); setTags([]); setErrors({});
    setActiveTab(0); setApiError('');
    onClose?.();
  };

  /* ── Tab content renderers ── */
  const renderBasics = () => (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 3 }}>
      <Box>
        <Typography sx={{ color: '#1976d2', fontWeight: 600, mb: 2.5, fontSize: 14 }}>
          Instance Details
        </Typography>

        <FieldRow label="Name" required tooltip="Display name for this compliance policy">
          <TextField size="small" placeholder="Enter Name" fullWidth
            value={formData.name} onChange={handleChange('name')}
            error={!!errors.name} helperText={errors.name} />
        </FieldRow>

        <FieldRow label="Additional Name" tooltip="Optional secondary identifier">
          <TextField size="small" placeholder="Enter Additional Name" fullWidth
            value={formData.additionalName} onChange={handleChange('additionalName')} />
        </FieldRow>

        <FieldRow label="VM Count" required tooltip="Number of VMs to provision">
          <TextField size="small" type="number" fullWidth
            value={formData.vmCount} onChange={handleChange('vmCount')}
            inputProps={{ min: 1 }} />
        </FieldRow>

        <FieldRow label="Schedule" required tooltip="Date and time to schedule creation">
          <TextField size="small" type="datetime-local" fullWidth
            value={formData.schedule} onChange={handleChange('schedule')}
            error={!!errors.schedule} helperText={errors.schedule}
            InputLabelProps={{ shrink: true }} />
        </FieldRow>

        <FieldRow label="Template" required tooltip="Select a base template">
          <Box>
            <FormControl size="small" fullWidth error={!!errors.template}>
              <Select value={formData.template} onChange={handleChange('template')}
                displayEmpty renderValue={v => v || <Box component="span" sx={{ color: '#9ca3af' }}>Select Template</Box>}>
                {templateOptions.map(t => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
              {errors.template && <FormHelperText>{errors.template}</FormHelperText>}
            </FormControl>
          </Box>
        </FieldRow>

        <FieldRow label="Resources" required tooltip="Allocate CPU, RAM, and disk">
          <Typography component="span" sx={{ fontSize: 14, color: '#1976d2', fontWeight: 500, cursor: 'pointer', pt: 0.5, display: 'block' }}>
            Configure Resources
          </Typography>
        </FieldRow>
      </Box>

      <Box sx={{ pt: 5, pr: 1 }}>
        <DonutChart used={parseInt(formData.vmCount) || 0} free={100 - (parseInt(formData.vmCount) || 0)} label="VM Count" />
      </Box>
    </Box>
  );

  const renderNetworking = () => (
    <Box>
      <Typography sx={{ color: '#1976d2', fontWeight: 600, mb: 2.5, fontSize: 14 }}>
        Networking Configuration
      </Typography>
      <FieldRow label="Region" tooltip="Select deployment region">
        <FormControl size="small" fullWidth>
          <Select value={formData.region} onChange={handleChange('region')}
            displayEmpty renderValue={v => v || <Box component="span" sx={{ color: '#9ca3af' }}>Select Region</Box>}>
            {regions.map(r => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </FieldRow>
      <FieldRow label="POD" tooltip="Select cloud POD">
        <FormControl size="small" fullWidth>
          <Select value={formData.pod} onChange={handleChange('pod')}
            displayEmpty renderValue={v => v || <Box component="span" sx={{ color: '#9ca3af' }}>Select POD</Box>}>
            {pods.map(p => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </FieldRow>
    </Box>
  );

  const renderAdvanced = () => (
    <Box>
      <Typography sx={{ color: '#1976d2', fontWeight: 600, mb: 3, fontSize: 14 }}>Add Tags</Typography>
      <FieldRow label="Existing Tags" tooltip="Associate previously created tags">
        <FormControl size="small" sx={{ maxWidth: 340, width: '100%' }}>
          <Select value={formData.existingTags} onChange={handleChange('existingTags')}
            displayEmpty renderValue={v => v || <Box component="span" sx={{ color: '#9ca3af' }}>Select Tags</Box>}
            sx={{ fontSize: 13 }}>
            <MenuItem value="">Select Tags</MenuItem>
            {existingTagOptions.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
        </FormControl>
      </FieldRow>
      <FieldRow label="New Tags" tooltip="Create and attach a new tag">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, maxWidth: 360 }}>
          <TextField size="small" placeholder="Please add tag name"
            value={formData.newTag} onChange={handleChange('newTag')}
            onKeyDown={e => e.key === 'Enter' && handleAddTag()} sx={{ flex: 1 }} />
          <IconButton onClick={handleAddTag}
            sx={{ bgcolor: '#1976d2', color: '#fff', borderRadius: 1, width: 34, height: 34, '&:hover': { bgcolor: '#1565c0' } }}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </FieldRow>
      {tags.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, ml: '186px' }}>
          {tags.map(t => (
            <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 1, px: 1, py: 0.25, fontSize: 12 }}>
              <Typography variant="caption">{t}</Typography>
              <CloseIcon sx={{ fontSize: 13, cursor: 'pointer', color: 'text.secondary' }}
                onClick={() => setTags(prev => prev.filter(x => x !== t))} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );

  const renderReview = () => (
    <Box>
      {hasBasicsError && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#fff3e0', border: '1px solid #ffcc80', borderRadius: 1, px: 2, py: 1.25, mb: 2.5 }}>
          <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: '#f57c00' }} />
          <Typography sx={{ fontSize: 13, color: '#e65100' }}>
            Almost there! Please review the missing or incorrect details and try again.
          </Typography>
        </Box>
      )}
      <Typography sx={{ color: '#1976d2', fontWeight: 600, mb: 1.5, fontSize: 14 }}>Basics</Typography>
      {[
        { label: 'Name',           value: formData.name },
        { label: 'Additional Name',value: formData.additionalName },
        { label: 'VM Count',       value: formData.vmCount },
        { label: 'Schedule',       value: formData.schedule ? new Date(formData.schedule).toLocaleString() : '—' },
        { label: 'Template',       value: formData.template || '—' },
        { label: 'Region',         value: formData.region || '—' },
        { label: 'POD',            value: formData.pod || '—' },
        { label: 'Tags',           value: tags.join(', ') || '—' },
      ].map(item => (
        <Box key={item.label} sx={{ display: 'flex', gap: 2, py: 1.25, borderBottom: '1px solid #f0f0f0' }}>
          <Typography sx={{ minWidth: 160, fontSize: 13, color: 'text.secondary' }}>{item.label}</Typography>
          <Typography sx={{ fontSize: 13 }}>{item.value || '—'}</Typography>
        </Box>
      ))}
    </Box>
  );

  const tabContent = [renderBasics, renderNetworking, renderAdvanced, renderReview];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#fff' }}>

      {/* ── Header ── */}
      <Box sx={{ px: 3, pt: 2, pb: 0, flexShrink: 0, borderBottom: '1px solid #e0e0e0' }}>
        {/* Breadcrumb */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <Typography
            sx={{ fontSize: 13, color: '#1976d2', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={handleClose}
          >
            Compliance Policy
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#9e9e9e' }}>&gt;</Typography>
          <Typography sx={{ fontSize: 13, color: '#757575' }}>Create</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton size="small" onClick={handleClose} sx={{ color: '#424242' }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <ComputerOutlinedIcon sx={{ color: '#1976d2', fontSize: 26 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 18 }}>
              Create Compliance Policy
            </Typography>
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}
          sx={{
            minHeight: 36,
            '& .MuiTab-root': { textTransform: 'none', fontSize: 13, minHeight: 36, py: 0.5, px: 1.5 },
            '& .Mui-selected': { color: '#1976d2', fontWeight: 600 },
            '& .MuiTabs-indicator': { bgcolor: '#1976d2' },
          }}>
          {TABS.map((tab, i) => (
            <Tab key={tab} label={tab} value={i}
              sx={{ color: hasBasicsError && i === 0 ? '#e53935 !important' : undefined }} />
          ))}
        </Tabs>
      </Box>

      {/* Description banner */}
      {TAB_DESCRIPTIONS[activeTab] && (
        <Box sx={{ px: 3, py: 1.25, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', flexShrink: 0 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, lineHeight: 1.5 }}>
            {TAB_DESCRIPTIONS[activeTab]}
          </Typography>
        </Box>
      )}

      {/* ── Body ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
        {apiError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }} onClose={() => setApiError('')}>
            {apiError}
          </Alert>
        )}
        {tabContent[activeTab]()}
      </Box>

      <Divider />

      {/* ── Footer ── */}
      <Box sx={{ px: 3, py: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <Button variant="outlined" size="small" onClick={handlePrev} disabled={activeTab === 0}
          sx={{ textTransform: 'none', fontSize: 13, borderColor: '#bdbdbd', color: 'text.primary' }}>
          &lt; Previous
        </Button>
        <Button variant="outlined" size="small" onClick={handleNext} disabled={activeTab === TABS.length - 1}
          sx={{ textTransform: 'none', fontSize: 13, borderColor: '#bdbdbd', color: 'text.primary' }}>
          Next &gt;
        </Button>
        <Button variant="contained" color="primary" size="small"
          onClick={activeTab === TABS.length - 1 ? handleCreate : () => setActiveTab(TABS.length - 1)}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={13} color="inherit" /> : null}
          sx={{ textTransform: 'none', fontSize: 13 }}>
          {submitting ? 'Creating…' : 'Review + Create'}
        </Button>
        <Button variant="outlined" size="small" onClick={handleClose}
          sx={{ textTransform: 'none', fontSize: 13, ml: 1 }}>
          Cancel
        </Button>
      </Box>

      {/* Fixed Feedback button */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<FeedbackOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={() => alert('Thank you for your feedback!')}
          sx={{ textTransform: 'none', fontSize: 13, borderRadius: 2, px: 2, boxShadow: '0 2px 8px rgba(25,118,210,0.45)' }}
        >
          Feedback
        </Button>
      </Box>
    </Box>
  );
};

export default CreateVMDialog;
