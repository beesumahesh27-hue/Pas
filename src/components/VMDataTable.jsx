import React from 'react';
import {
  Box,
  IconButton,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import MoreVertIcon   from '@mui/icons-material/MoreVert';

export const VM_COLUMNS = [
  { key: 'cloudPod',    label: 'Cloud POD' },
  { key: 'vmName',      label: 'VM Name' },
  { key: 'vmUuid',      label: 'VM UUID' },
  { key: 'powerState',  label: 'Power\nState', wrap: true },
  { key: 'primaryIp',   label: 'Primary IP' },
  { key: 'guestOs',     label: 'Guest OS' },
  { key: 'minCpu',      label: 'Min CPU' },
  { key: 'maxCpu',      label: 'Max CPU' },
  { key: 'minRam',      label: 'Min RAM (GB)' },
  { key: 'maxRam',      label: 'Max RAM (GB)' },
  { key: 'totalDisk',   label: 'Total Disk Size (GB)' },
  { key: 'totalUptime', label: 'Total Uptime' },
];

const VMDataTable = ({ rows = [], onCreateClick, onRowClick, onActionClick, emptyLabel }) => (
  <TableContainer component={Paper} sx={{ overflowX: 'auto', width: '100%' }}>
    <Table size="small" sx={{ minWidth: 1100, borderCollapse: 'collapse' }}>
      <TableHead sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? t.palette.grey[800] : '#f5f5f5' }}>
        <TableRow>
          {VM_COLUMNS.map((col) => (
            <TableCell
              key={col.key}
              sx={{
                fontWeight: 700, fontSize: 13,
                py: 1.5, px: 1.5,
                whiteSpace: col.wrap ? 'normal' : 'nowrap',
                lineHeight: 1.3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                {col.label}
                <UnfoldMoreIcon sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0, mt: col.wrap ? 'auto' : 0 }} />
              </Box>
            </TableCell>
          ))}
          <TableCell sx={{ fontWeight: 700, fontSize: 13, py: 1.5, px: 1.5, whiteSpace: 'nowrap' }}>
            Actions
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {rows.length === 0 ? (
          <TableRow sx={{ '&:hover': { bgcolor: 'transparent' } }}>
            <TableCell colSpan={VM_COLUMNS.length + 1} align="center" sx={{ border: 0, py: 12 }}>
              <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 1 }}>
                {emptyLabel || 'No records found.'}
              </Typography>
              <Link
                component="button"
                underline="none"
                onClick={onCreateClick}
                sx={{ color: 'primary.main', fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 0.25, cursor: 'pointer' }}
              >
                + Create
              </Link>
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row, idx) => (
            <TableRow
              key={row.id ?? idx}
              hover
              onClick={() => onRowClick && onRowClick(row)}
              sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {VM_COLUMNS.map((col) => (
                <TableCell key={col.key} sx={{ fontSize: 13, px: 1.5, color: 'text.primary' }}>
                  {col.key === 'vmName' ? (
                    <Typography component="span" sx={{ fontSize: 13, color: 'primary.main', fontWeight: 500, cursor: 'pointer' }}>
                      {row[col.key] ?? '—'}
                    </Typography>
                  ) : (
                    row[col.key] ?? '—'
                  )}
                </TableCell>
              ))}
              <TableCell sx={{ px: 1.5 }}>
                <Tooltip title="Actions" placement="top" arrow>
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onActionClick && onActionClick(e, row); }}
                    sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: (t) => t.palette.mode === 'dark' ? t.palette.grey[700] : '#e3f2fd' } }}
                  >
                    <MoreVertIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </TableContainer>
);

export default VMDataTable;
