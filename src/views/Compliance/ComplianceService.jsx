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
  Snackbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeOutlinedIcon        from '@mui/icons-material/HomeOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import CheckCircleOutlineIcon   from '@mui/icons-material/CheckCircleOutline';
import PolicyOutlinedIcon       from '@mui/icons-material/PolicyOutlined';
import LabelOutlinedIcon        from '@mui/icons-material/LabelOutlined';
import CloudOutlinedIcon        from '@mui/icons-material/CloudOutlined';

import api from '../../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const POLICY_GROUPS = [
  {
    key: 'templates',
    label: 'Compliance Templates',
    icon: <PolicyOutlinedIcon sx={{ fontSize: 20, color: '#1976d2' }} />,
    color: '#1976d2',
    bg: '#e3f2fd',
  },
  {
    key: 'tags',
    label: 'Compliance Tags',
    icon: <LabelOutlinedIcon sx={{ fontSize: 20, color: '#7b1fa2' }} />,
    color: '#7b1fa2',
    bg: '#f3e5f5',
  },
];

const ComplianceService = () => {
  const navigate = useNavigate();

  const [platforms, setPlatforms]       = useState([]);
  const [templates, setTemplates]       = useState([]);
  const [tags, setTags]                 = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [checked, setChecked]           = useState({});
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [snack, setSnack]               = useState({ open: false, msg: '', severity: 'success' });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, tRes, gRes] = await Promise.all([
        api.get('/platforms/'),
        api.get('/compliance/templates'),
        api.get('/compliance/tags'),
      ]);
      setPlatforms(pRes.data);
      setTemplates(tRes.data);
      setTags(gRes.data);
      if (pRes.data.length > 0) setSelectedPlatform(pRes.data[0].id);
    } catch (_e) {
      setSnack({ open: true, msg: 'Failed to load compliance data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCheck = (group, id) => {
    setChecked(prev => ({
      ...prev,
      [`${group}_${id}`]: !prev[`${group}_${id}`],
    }));
  };

  const handleSelectAll = (group, items) => {
    const allSelected = items.every(item => checked[`${group}_${item.id}`]);
    const next = { ...checked };
    items.forEach(item => { next[`${group}_${item.id}`] = !allSelected; });
    setChecked(next);
  };

  const selectedPlatformObj = platforms.find(p => p.id === selectedPlatform);

  const getSelectedItems = () => {
    const selectedTemplates = templates.filter(t => checked[`templates_${t.id}`]).map(t => t.name);
    const selectedTags      = tags.filter(t => checked[`tags_${t.id}`]).map(t => t.name);
    return { selectedTemplates, selectedTags };
  };

  const handleSubmit = async () => {
    const { selectedTemplates, selectedTags } = getSelectedItems();
    const total = selectedTemplates.length + selectedTags.length;
    if (total === 0) {
      setSnack({ open: true, msg: 'Please select at least one compliance policy', severity: 'warning' });
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    setSubmitting(false);
    setSnack({
      open: true,
      msg: `Compliance applied: ${total} polic${total === 1 ? 'y' : 'ies'} for "${selectedPlatformObj?.pas_name}"`,
      severity: 'success',
    });
  };

  const handleExport = () => {
    const { selectedTemplates, selectedTags } = getSelectedItems();
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Compliance Service Report', 14, 18);
    doc.setFontSize(10);
    doc.text(`Platform: ${selectedPlatformObj?.pas_name || '-'}`, 14, 28);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);

    const rows = [
      ...templates.map(t => [
        'Template',
        t.name,
        checked[`templates_${t.id}`] ? 'Selected' : 'Not Selected',
      ]),
      ...tags.map(t => [
        'Tag',
        t.name,
        checked[`tags_${t.id}`] ? 'Selected' : 'Not Selected',
      ]),
    ];

    autoTable(doc, {
      startY: 42,
      head: [['Type', 'Policy', 'Status']],
      body: rows,
      headStyles: { fillColor: [25, 118, 210] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`compliance_${selectedPlatformObj?.pas_name || 'report'}_${Date.now()}.pdf`);
  };

  const allTemplatesSelected = templates.length > 0 && templates.every(t => checked[`templates_${t.id}`]);
  const allTagsSelected      = tags.length > 0      && tags.every(t => checked[`tags_${t.id}`]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)', bgcolor: '#f5f6fa' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <Box sx={{ px: 3, pt: 2.5, pb: 1.5, bgcolor: '#fff', borderBottom: '1px solid #e0e0e0' }}>
        <Breadcrumbs sx={{ mb: 1 }}>
          <Link
            underline="hover"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', fontSize: 13 }}
            onClick={() => navigate('/')}
          >
            <HomeOutlinedIcon sx={{ fontSize: 15 }} /> Home
          </Link>
          <Typography color="text.primary" sx={{ fontSize: 13 }}>Compliance Service</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <VerifiedUserOutlinedIcon sx={{ fontSize: 30, color: '#1976d2' }} />
            <Typography variant="h5" fontWeight={700}>Compliance Service</Typography>
          </Box>

          {/* Single export option */}
          <Tooltip title="Export compliance report as PDF">
            <Button
              variant="outlined"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={handleExport}
              disabled={loading}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Export PDF
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* ── Body ───────────────────────────────────────────── */}
      <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>

            {/* Platform selector */}
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <CloudOutlinedIcon sx={{ color: '#1976d2' }} />
                  <Typography fontWeight={600} sx={{ minWidth: 120 }}>Select Platform</Typography>
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
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => handleSelectAll('templates', templates)}
                      sx={{ textTransform: 'none', fontSize: 12 }}
                    >
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
                            <Typography variant="body2" fontWeight={500}>{t.name}</Typography>
                          </Box>
                        }
                        sx={{
                          mb: 0.5,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: checked[`templates_${t.id}`] ? '#1976d2' : '#e0e0e0',
                          bgcolor: checked[`templates_${t.id}`] ? '#e3f2fd' : 'transparent',
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
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => handleSelectAll('tags', tags)}
                      sx={{ textTransform: 'none', fontSize: 12, color: '#7b1fa2' }}
                    >
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
                          <Typography variant="body2" fontWeight={500}>{t.name}</Typography>
                        }
                        sx={{
                          mb: 0.5,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: checked[`tags_${t.id}`] ? '#7b1fa2' : '#e0e0e0',
                          bgcolor: checked[`tags_${t.id}`] ? '#f3e5f5' : 'transparent',
                          transition: 'all 0.15s',
                        }}
                      />
                    ))}
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>

            {/* Selection summary */}
            {Object.values(checked).some(Boolean) && (
              <Grid item xs={12}>
                <Alert
                  icon={<CheckCircleOutlineIcon />}
                  severity="info"
                  sx={{ borderRadius: 2 }}
                >
                  {(() => {
                    const { selectedTemplates, selectedTags } = getSelectedItems();
                    const parts = [];
                    if (selectedTemplates.length) parts.push(`Templates: ${selectedTemplates.join(', ')}`);
                    if (selectedTags.length)      parts.push(`Tags: ${selectedTags.join(', ')}`);
                    return `Selected for "${selectedPlatformObj?.pas_name}": ${parts.join(' · ')}`;
                  })()}
                </Alert>
              </Grid>
            )}

          </Grid>
        )}
      </Box>

      {/* ── Sticky Footer ──────────────────────────────────── */}
      <Paper
        elevation={4}
        sx={{
          px: 3, py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 2,
          borderTop: '1px solid #e0e0e0',
          borderRadius: 0,
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {Object.values(checked).filter(Boolean).length} polic{Object.values(checked).filter(Boolean).length === 1 ? 'y' : 'ies'} selected
        </Typography>
        <Button
          variant="outlined"
          onClick={() => setChecked({})}
          disabled={submitting || !Object.values(checked).some(Boolean)}
          sx={{ textTransform: 'none' }}
        >
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
      </Paper>

      {/* ── Snackbar ───────────────────────────────────────── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default ComplianceService;
