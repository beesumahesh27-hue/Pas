import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Divider,
  Drawer,
  FormControl,
  FormHelperText,
  IconButton,
  Menu,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useOutletContext } from 'react-router-dom';
import api from '../../../services/api';

const COLUMNS = [
  { key: 'disk_name',    label: 'Disk' },
  { key: 'devices',      label: 'Devices' },
  { key: 'storage_uuid', label: 'Storage UUID' },
  { key: 'lag_time',     label: 'Lag Time' },
  { key: 'size_gb',      label: 'Size (GB)' },
  { key: 'iops',         label: 'IOPS' },
  { key: 'disk_class',   label: 'Class' },
  { key: 'encryption',   label: 'Encryption' },
];

const INITIAL_DISK = { disk_name: '', size_gb: '', disk_class: '', iops: '', encryption: '' };

/* ── Shared Disk Form Drawer (used for both Add and Edit) ── */
const DiskDrawer = ({ open, onClose, onSaved, vmId, editDisk }) => {
  const isEdit = Boolean(editDisk);
  const [form, setForm]                       = useState(INITIAL_DISK);
  const [errors, setErrors]                   = useState({});
  const [saving, setSaving]                   = useState(false);
  const [apiError, setApiError]               = useState('');
  const [diskClasses, setDiskClasses]         = useState([]);
  const [diskEncryptions, setDiskEncryptions] = useState([]);

  useEffect(() => {
    if (!open) return;
    api.get('/options/disk-classes').then(({ data }) => setDiskClasses(data.map(d => d.name))).catch(() => {});
    api.get('/options/disk-encryptions').then(({ data }) => setDiskEncryptions(data.map(d => d.name))).catch(() => {});
    if (isEdit && editDisk) {
      setForm({
        disk_name:  editDisk.disk_name  || '',
        size_gb:    editDisk.size_gb    ?? '',
        disk_class: editDisk.disk_class || '',
        iops:       editDisk.iops       ?? '',
        encryption: editDisk.encryption || '',
      });
    } else {
      setForm(INITIAL_DISK);
    }
    setErrors({});
    setApiError('');
  }, [open, editDisk]);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (apiError) setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.disk_name.trim()) errs.disk_name  = 'Disk name is required';
    if (!form.size_gb)          errs.size_gb    = 'Size is required';
    if (!form.disk_class)       errs.disk_class = 'Class is required';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        disk_name:  form.disk_name,
        size_gb:    parseInt(form.size_gb, 10),
        disk_class: form.disk_class,
        encryption: form.encryption || null,
      };
      if (form.iops) payload.iops = parseInt(form.iops, 10);

      if (isEdit) {
        await api.put(`/vms/${vmId}/disks/${editDisk.id}`, payload);
      } else {
        await api.post(`/vms/${vmId}/disks`, payload);
      }
      onSaved?.();
      onClose?.();
    } catch (err) {
      const msg = err.response?.data?.detail || `Failed to ${isEdit ? 'update' : 'add'} disk.`;
      setApiError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setForm(INITIAL_DISK);
    setErrors({});
    setApiError('');
    onClose?.();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography sx={{ fontWeight: 600, fontSize: 17 }}>{isEdit ? 'Edit Disk' : 'Add Disk'}</Typography>
          <IconButton size="small" onClick={handleClose}><CloseIcon fontSize="small" /></IconButton>
        </Box>

        {/* Body */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3 }}>
          {apiError && (
            <Box sx={{ mb: 2, p: 1.5, bgcolor: '#ffebee', borderRadius: 1, fontSize: 13, color: '#c62828' }}>
              {apiError}
            </Box>
          )}

          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>
              Disk Name <Box component="span" sx={{ color: '#e53935' }}>*</Box>
            </Typography>
            <TextField
              size="small" fullWidth placeholder="Enter disk name"
              value={form.disk_name} onChange={handleChange('disk_name')}
              error={!!errors.disk_name} helperText={errors.disk_name}
            />
          </Box>

          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>
              Size (GB) <Box component="span" sx={{ color: '#e53935' }}>*</Box>
            </Typography>
            <TextField
              size="small" fullWidth type="number" placeholder="e.g. 100"
              value={form.size_gb} onChange={handleChange('size_gb')}
              error={!!errors.size_gb} helperText={errors.size_gb}
              inputProps={{ min: 1 }}
            />
          </Box>

          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>
              Class <Box component="span" sx={{ color: '#e53935' }}>*</Box>
            </Typography>
            <FormControl size="small" fullWidth error={!!errors.disk_class}>
              <Select
                value={form.disk_class} onChange={handleChange('disk_class')}
                displayEmpty
                renderValue={v => v || <Box component="span" sx={{ color: '#9ca3af' }}>Select Class</Box>}
              >
                {diskClasses.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
              {errors.disk_class && <FormHelperText>{errors.disk_class}</FormHelperText>}
            </FormControl>
          </Box>

          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>IOPS</Typography>
            <TextField
              size="small" fullWidth type="number" placeholder="e.g. 3000"
              value={form.iops} onChange={handleChange('iops')}
            />
          </Box>

          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>Encryption</Typography>
            <FormControl size="small" fullWidth>
              <Select value={form.encryption} onChange={handleChange('encryption')}
                displayEmpty renderValue={v => v || <Box component="span" sx={{ color: '#9ca3af' }}>Select Encryption</Box>}>
                {diskEncryptions.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Footer */}
        <Divider />
        <Box sx={{ display: 'flex', gap: 1.5, px: 3, py: 2 }}>
          <Button variant="outlined" onClick={handleClose} disabled={saving} sx={{ textTransform: 'none', minWidth: 80 }}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave} disabled={saving} sx={{ textTransform: 'none', minWidth: 100 }}>
            {saving ? (isEdit ? 'Saving…' : 'Adding…') : (isEdit ? 'Save Changes' : 'Add Disk')}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

const VMDisks = () => {
  const { vmId } = useOutletContext() ?? {};
  const [disks, setDisks]             = useState([]);
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage]               = useState(0);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [editDisk, setEditDisk]       = useState(null);
  const [menuAnchor, setMenuAnchor]   = useState(null);
  const [menuDisk, setMenuDisk]       = useState(null);

  const fetchDisks = (searchTerm = search) => {
    if (!vmId) return;
    setLoading(true);
    const params = searchTerm ? { search: searchTerm } : {};
    api.get(`/vms/${vmId}/disks`, { params })
      .then(({ data }) => setDisks(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDisks(''); }, [vmId]);

  // Debounce: trigger API search 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
      fetchDisks(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const openAdd  = () => { setEditDisk(null); setDrawerOpen(true); };
  const openEdit = (disk) => { setMenuAnchor(null); setMenuDisk(null); setEditDisk(disk); setDrawerOpen(true); };

  const handleMenuOpen  = (e, disk) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); setMenuDisk(disk); };
  const handleMenuClose = () => { setMenuAnchor(null); setMenuDisk(null); };

  const handleDelete = async () => {
    handleMenuClose();
    if (!menuDisk) return;
    await api.delete(`/vms/${vmId}/disks/${menuDisk.id}`).catch(() => {});
    fetchDisks();
  };

  const totalRecords = disks.length;
  const paginated    = disks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPages   = Math.ceil(totalRecords / rowsPerPage);

  return (
    <Box sx={{ p: 2.5 }}>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained" size="small"
          startIcon={<AddIcon sx={{ fontSize: 15 }} />}
          onClick={openAdd}
          sx={{ textTransform: 'none', fontSize: 13 }}
        >
          Add Disk
        </Button>
        <Button
          variant="outlined" size="small"
          startIcon={<RefreshIcon sx={{ fontSize: 15 }} />}
          onClick={() => fetchDisks(searchInput)} disabled={loading}
          sx={{ textTransform: 'none', fontSize: 13, borderColor: '#c8c8c8', color: '#424242' }}
        >
          Refresh
        </Button>
        <TextField
          size="small" placeholder="Search disks..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          InputProps={{
            startAdornment: <SearchOutlinedIcon sx={{ mr: 0.5, color: '#9e9e9e', fontSize: 16 }} />,
            sx: { fontSize: 13 },
          }}
          sx={{ minWidth: 220 }}
        />
        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: 13, color: '#757575' }}>
          Showing {totalRecords === 0 ? 0 : page * rowsPerPage + 1} to{' '}
          {Math.min((page + 1) * rowsPerPage, totalRecords)} of {totalRecords} Records
        </Typography>
      </Box>

      {/* Table */}
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableCell key={col.key} sx={{ fontWeight: 600, fontSize: 13, color: '#424242', py: 1.25, px: 1.5, whiteSpace: 'nowrap', borderTop: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                    {col.label}
                    <UnfoldMoreIcon sx={{ fontSize: 14, color: '#bdbdbd' }} />
                  </Box>
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 600, fontSize: 13, color: '#424242', py: 1.25, px: 1.5, borderTop: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMNS.length + 1} align="center" sx={{ border: 0, py: 8 }}>
                  <Typography sx={{ fontSize: 14, color: '#9e9e9e' }}>
                    {loading ? 'Loading...' : 'No disks found.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((disk) => (
                <TableRow key={disk.id} hover sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                  {COLUMNS.map((col) => (
                    <TableCell key={col.key} sx={{ fontSize: 13, px: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                      {disk[col.key] ?? '—'}
                    </TableCell>
                  ))}
                  <TableCell sx={{ px: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                    <Tooltip title="Actions" placement="top" arrow>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, disk)} sx={{ color: '#757575', '&:hover': { color: '#1976d2' } }}>
                        <MoreHorizIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Row action menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { minWidth: 140, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' } }}
      >
        <MenuItem onClick={() => openEdit(menuDisk)} sx={{ fontSize: 13, gap: 1 }}>
          <EditOutlinedIcon sx={{ fontSize: 16, color: '#1976d2' }} /> Edit
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ fontSize: 13, gap: 1, color: '#e53935' }}>
          <DeleteOutlineIcon sx={{ fontSize: 16 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Pagination */}
      {totalRecords > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 2, mt: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Button size="small" disabled={page === 0} onClick={() => setPage(p => p - 1)} sx={{ minWidth: 30, fontSize: 13 }}>&lt;</Button>
            <Typography sx={{ fontSize: 13 }}>{page + 1} / {totalPages || 1}</Typography>
            <Button size="small" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} sx={{ minWidth: 30, fontSize: 13 }}>&gt;</Button>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: 13, color: '#757575' }}>Rows per page:</Typography>
            <Select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }} size="small" sx={{ fontSize: 13, height: 30, minWidth: 60 }}>
              {[5, 10, 25, 50].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </Select>
          </Box>
        </Box>
      )}

      {/* Add / Edit Drawer */}
      <DiskDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSaved={fetchDisks}
        vmId={vmId}
        editDisk={editDisk}
      />
    </Box>
  );
};

export default VMDisks;
