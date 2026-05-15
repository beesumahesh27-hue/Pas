import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  Link,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackOutlinedIcon   from '@mui/icons-material/ArrowBackOutlined';
import CheckCircleOutlineIcon  from '@mui/icons-material/CheckCircleOutline';
import PolicyOutlinedIcon      from '@mui/icons-material/PolicyOutlined';
import LabelOutlinedIcon       from '@mui/icons-material/LabelOutlined';
import CloudOutlinedIcon       from '@mui/icons-material/CloudOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';

import api from '../../services/api';

const DESCRIPTIONS = {
  'AI Template':            'Automated compliance checks using AI to detect policy violations and security risks in real time across your platform.',
  'CIS Benchmark':          'Industry-accepted best practices to secure IT systems and data against cyber threats, misconfigurations, and vulnerabilities.',
  'FedRAMP':                'Federal Risk and Authorization Management Program providing standardized cloud security assessment and government authorization.',
  'GDPR':                   'General Data Protection Regulation ensuring personal data privacy and protection for all individuals within the European Union.',
  'HIPAA':                  'Health Insurance Portability and Accountability Act safeguarding sensitive patient health information from unauthorized disclosure.',
  'ISO 27001':              'International standard for systematically managing information security risks through structured controls and continuous improvement.',
  'Manual Template':        'Custom compliance policy configured manually to meet your specific organizational, regional, and regulatory requirements.',
  'NIST CSF':               'NIST Cybersecurity Framework providing guidelines to manage and reduce cybersecurity risk across critical infrastructure.',
  'PCI-DSS':                'Payment Card Industry Data Security Standard protecting cardholder data and securing all payment transaction environments.',
  'SOC 2 Type II':          'Service Organization Control report verifying the security, availability, and confidentiality of your customer data over time.',
  'Template from Library':  'Pre-built compliance template from a curated library of industry-standard security and governance policy configurations.',
  'AWS Tag':                'Tag applied to Amazon Web Services resources for compliance tracking, cost allocation, and cloud governance enforcement.',
  'Azure Tag':              'Tag applied to Microsoft Azure resources to enforce compliance policies, governance standards, and resource management.',
  'Critical':               'Marks resources requiring immediate compliance attention due to high-risk security vulnerabilities and exposure.',
  'Data Privacy':           'Ensures all data handling practices comply with global privacy laws and adequately protect sensitive user information.',
  'Development':            'Applied to development environments to enforce baseline security and compliance standards during the coding phase.',
  'Encryption Required':    'Mandates data encryption at rest and in transit to protect sensitive information from unauthorized access and breaches.',
  'High Risk':              'Identifies resources with elevated security risk levels requiring enhanced monitoring and strict compliance controls.',
  'Low Risk':               'Applied to resources with minimal security exposure that require standard compliance measures and routine audits.',
  'Production':             'Marks production environment resources requiring full compliance enforcement, strict security standards, and audit trails.',
  'Staging':                'Applied to staging environments to validate compliance policies and security configurations before production deployment.',
  'Testing':                'Used during testing phases to verify compliance configurations, simulate policy checks, and identify any gaps.',
};

const ComplianceService = () => {
  const navigate = useNavigate();

  const [platforms, setPlatforms]               = useState([]);
  const [templates, setTemplates]               = useState([]);
  const [tags, setTags]                         = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [checked, setChecked]                   = useState({});
  const [loading, setLoading]                   = useState(true);
  const [submitting, setSubmitting]             = useState(false);
  const [apiError, setApiError]                 = useState('');
  const [successMsg, setSuccessMsg]             = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    const [pRes, tRes, gRes] = await Promise.allSettled([
      api.get('/platforms/'),
      api.get('/compliance/templates'),
      api.get('/compliance/tags'),
    ]);
    if (pRes.status === 'fulfilled') {
      setPlatforms(pRes.value.data);
      if (pRes.value.data.length > 0) setSelectedPlatform(pRes.value.data[0].id);
    }
    if (tRes.status === 'fulfilled') setTemplates(tRes.value.data);
    if (gRes.status === 'fulfilled') setTags(gRes.value.data);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCheck = (group, id) => {
    setChecked(prev => ({ ...prev, [`${group}_${id}`]: !prev[`${group}_${id}`] }));
  };

  const handleSelectAll = (group, items) => {
    const allSelected = items.every(item => checked[`${group}_${item.id}`]);
    const next = { ...checked };
    items.forEach(item => { next[`${group}_${item.id}`] = !allSelected; });
    setChecked(next);
  };

  const selectedPlatformObj = platforms.find(p => p.id === selectedPlatform);

  const getSelectedItems = () => ({
    selectedTemplates: templates.filter(t => checked[`templates_${t.id}`]).map(t => t.name),
    selectedTags:      tags.filter(t => checked[`tags_${t.id}`]).map(t => t.name),
  });

  const handleSubmit = async () => {
    const { selectedTemplates, selectedTags } = getSelectedItems();
    if (selectedTemplates.length + selectedTags.length === 0) {
      setApiError('Please select at least one compliance policy.');
      return;
    }
    setSubmitting(true);
    setApiError('');
    try {
      await api.post('/compliance/submit', {
        platform_id:   selectedPlatformObj.id,
        platform_name: selectedPlatformObj.pas_name,
        templates:     selectedTemplates,
        tags:          selectedTags,
      });
      setSuccessMsg(`Compliance policy submitted for "${selectedPlatformObj.pas_name}".`);
      setChecked({});
      setTimeout(() => navigate('/compliances'), 1500);
    } catch (_e) {
      setApiError('Failed to submit compliance policy. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const allTemplatesSelected = templates.length > 0 && templates.every(t => checked[`templates_${t.id}`]);
  const allTagsSelected      = tags.length > 0      && tags.every(t => checked[`tags_${t.id}`]);
  const totalSelected        = Object.values(checked).filter(Boolean).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default' }}>

      {/* ── Header ── */}
      <Box sx={{ px: 3, pt: 2.5, pb: 1.5, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Breadcrumbs separator="›" sx={{ mb: 1, fontSize: 13 }}>
          <Link href="/" underline="hover" sx={{ fontSize: 13, color: '#1976d2', fontWeight: 500 }}>Home</Link>
          <Link
            underline="hover"
            sx={{ fontSize: 13, color: '#1976d2', fontWeight: 500, cursor: 'pointer' }}
            onClick={() => navigate('/compliances')}
          >
            Compliance Service
          </Link>
          <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>Create</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            startIcon={<ArrowBackOutlinedIcon />}
            onClick={() => navigate('/compliances')}
            sx={{ textTransform: 'none', color: '#424242', minWidth: 0, mr: 1 }}
          >
            Back
          </Button>
          <VerifiedUserOutlinedIcon sx={{ fontSize: 30, color: '#1976d2' }} />
          <Typography variant="h5" fontWeight={700}>Create Compliance Policy</Typography>
        </Box>
      </Box>

      {/* ── Body ── */}
      <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>

        {apiError && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setApiError('')}>
            {apiError}
          </Alert>
        )}
        {successMsg && (
          <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>
            {successMsg} Redirecting…
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>

            {/* Platform selector */}
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', py: '14px !important' }}>
                  <CloudOutlinedIcon sx={{ color: '#1976d2' }} />
                  <Typography fontWeight={600} sx={{ minWidth: 130 }}>Select Platform</Typography>
                  <Select
                    size="small"
                    value={selectedPlatform}
                    onChange={e => setSelectedPlatform(e.target.value)}
                    sx={{ minWidth: 240 }}
                  >
                    {platforms.map(p => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.pas_name}
                        <Chip
                          label={p.status}
                          size="small"
                          sx={{
                            ml: 1,
                            bgcolor: p.status === 'Active' ? '#e8f5e9' : '#fff3e0',
                            color:   p.status === 'Active' ? '#43a047' : '#fb8c00',
                            fontSize: 11,
                          }}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                  {selectedPlatformObj && (
                    <Typography variant="body2" color="text.secondary">
                      Region: <strong>{selectedPlatformObj.region}</strong> &nbsp;|&nbsp;
                      Type: <strong>{selectedPlatformObj.type}</strong>
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Compliance Templates */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PolicyOutlinedIcon sx={{ color: '#1976d2' }} />
                      <Typography fontWeight={700}>Compliance Templates</Typography>
                      <Chip label={templates.length} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }} />
                    </Box>
                    <Button size="small" variant="text" onClick={() => handleSelectAll('templates', templates)}
                      sx={{ textTransform: 'none', fontSize: 12 }}>
                      {allTemplatesSelected ? 'Deselect All' : 'Select All'}
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <FormGroup>
                    {templates.map(t => (
                      <FormControlLabel
                        key={t.id}
                        control={
                          <Checkbox
                            checked={!!checked[`templates_${t.id}`]}
                            onChange={() => handleCheck('templates', t.id)}
                            sx={{ color: '#1976d2', '&.Mui-checked': { color: '#1976d2' } }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{t.name}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4, mt: 0.2 }}>
                              {DESCRIPTIONS[t.name] || ''}
                            </Typography>
                          </Box>
                        }
                        sx={{
                          mb: 0.5, px: 1.5, py: 0.75, borderRadius: 1.5,
                          border: '1px solid', alignItems: 'flex-start',
                          borderColor: checked[`templates_${t.id}`] ? '#1976d2' : '#e0e0e0',
                          bgcolor:     checked[`templates_${t.id}`] ? '#e3f2fd' : 'transparent',
                          transition: 'all 0.15s',
                        }}
                      />
                    ))}
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>

            {/* Compliance Tags */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LabelOutlinedIcon sx={{ color: '#7b1fa2' }} />
                      <Typography fontWeight={700}>Compliance Tags</Typography>
                      <Chip label={tags.length} size="small" sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2' }} />
                    </Box>
                    <Button size="small" variant="text" onClick={() => handleSelectAll('tags', tags)}
                      sx={{ textTransform: 'none', fontSize: 12, color: '#7b1fa2' }}>
                      {allTagsSelected ? 'Deselect All' : 'Select All'}
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <FormGroup>
                    {tags.map(t => (
                      <FormControlLabel
                        key={t.id}
                        control={
                          <Checkbox
                            checked={!!checked[`tags_${t.id}`]}
                            onChange={() => handleCheck('tags', t.id)}
                            sx={{ color: '#7b1fa2', '&.Mui-checked': { color: '#7b1fa2' } }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{t.name}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4, mt: 0.2 }}>
                              {DESCRIPTIONS[t.name] || ''}
                            </Typography>
                          </Box>
                        }
                        sx={{
                          mb: 0.5, px: 1.5, py: 0.75, borderRadius: 1.5,
                          border: '1px solid', alignItems: 'flex-start',
                          borderColor: checked[`tags_${t.id}`] ? '#7b1fa2' : '#e0e0e0',
                          bgcolor:     checked[`tags_${t.id}`] ? '#f3e5f5' : 'transparent',
                          transition: 'all 0.15s',
                        }}
                      />
                    ))}
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        )}
      </Box>

      {/* ── Sticky Footer ── */}
      <Paper elevation={4} sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e0e0e0', borderRadius: 0, position: 'sticky', bottom: 0, zIndex: 10 }}>
        <Typography variant="body2" color="text.secondary">
          {totalSelected} polic{totalSelected === 1 ? 'y' : 'ies'} selected
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" onClick={() => navigate('/compliances')} disabled={submitting}
            sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button variant="outlined" onClick={() => setChecked({})} disabled={submitting || totalSelected === 0}
            sx={{ textTransform: 'none' }}>
            Clear
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || loading}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutlineIcon />}
            sx={{ textTransform: 'none', fontWeight: 600, minWidth: 120 }}
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </Button>
        </Box>
      </Paper>

    </Box>
  );
};

export default ComplianceService;
