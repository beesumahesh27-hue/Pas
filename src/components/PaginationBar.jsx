import React from 'react';
import { Box, Button, IconButton, MenuItem, Select, Typography } from '@mui/material';
import ChevronLeftIcon  from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

/**
 * PaginationBar
 *
 * Props (1-indexed):
 *   page / totalPages / rowsPerPage / rowsPerPageOptions
 *   onPageChange / onRowsPerPageChange
 *   compact – true → icon-only prev/next, no "Rows per page" label (fits narrow panes)
 */
const PaginationBar = ({
  page = 1,
  totalPages = 1,
  rowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25],
  onPageChange,
  onRowsPerPageChange,
  compact = false,
}) => {

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4)              return [1, 2, 3, 4, 5, '...', totalPages];
    if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  const pageNumbers = getPageNumbers();

  const btn = {
    minWidth: 26,
    height: 26,
    px: 0.5,
    py: 0,
    fontSize: 12,
    fontWeight: 500,
    borderRadius: 1,
    textTransform: 'none',
    lineHeight: 1,
    flexShrink: 0,
  };

  const iconBtn = {
    width: 26,
    height: 26,
    borderRadius: 1,
    border: '1px solid',
    borderColor: 'divider',
    flexShrink: 0,
  };

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'nowrap' }}>

        {/* Rows per page label */}
        <Typography sx={{ fontSize: 11, color: 'text.secondary', flexShrink: 0, whiteSpace: 'nowrap' }}>
          Rows per page
        </Typography>

        {/* Rows-per-page select */}
        <Select
          size="small"
          value={rowsPerPage}
          onChange={(e) => { onRowsPerPageChange?.(Number(e.target.value)); onPageChange?.(1); }}
          sx={{
            fontSize: 11,
            height: 26,
            minWidth: 62,
            flexShrink: 0,
            '& .MuiSelect-select': { py: '3px', pl: '8px', pr: '28px !important' },
            '& .MuiSelect-icon': { right: 4 },
            '& fieldset': { borderColor: 'divider' },
          }}
        >
          {rowsPerPageOptions.map(opt => (
            <MenuItem key={opt} value={opt} sx={{ fontSize: 12 }}>{opt}</MenuItem>
          ))}
        </Select>

        {/* Prev icon */}
        <IconButton size="small" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)}
          sx={{ ...iconBtn, color: page <= 1 ? 'text.disabled' : 'primary.main', '&.Mui-disabled': { borderColor: 'divider' } }}>
          <ChevronLeftIcon sx={{ fontSize: 15 }} />
        </IconButton>

        {/* Page numbers */}
        {pageNumbers.map((p, idx) =>
          p === '...'
            ? <Typography key={`e-${idx}`} sx={{ fontSize: 11, color: 'text.secondary', lineHeight: '26px', flexShrink: 0 }}>…</Typography>
            : (
              <Button key={p} size="small" onClick={() => onPageChange?.(p)}
                variant={p === page ? 'contained' : 'outlined'}
                sx={{
                  ...btn,
                  borderColor: p === page ? 'primary.main' : 'divider',
                  color: p === page ? '#fff' : 'primary.main',
                  bgcolor: p === page ? 'primary.main' : 'transparent',
                  '&:hover': {
                    bgcolor: p === page ? 'primary.dark' : (t) => t.palette.mode === 'dark' ? 'rgba(25,118,210,0.1)' : '#e3f2fd',
                    borderColor: 'primary.main',
                  },
                }}
              >
                {p}
              </Button>
            )
        )}

        {/* Next icon */}
        <IconButton size="small" disabled={page >= totalPages} onClick={() => onPageChange?.(page + 1)}
          sx={{ ...iconBtn, color: page >= totalPages ? 'text.disabled' : 'primary.main', '&.Mui-disabled': { borderColor: 'divider' } }}>
          <ChevronRightIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>

      {/* Rows per page */}
      <Typography sx={{ fontSize: 12, color: 'text.secondary', flexShrink: 0 }}>
        Rows per page
      </Typography>
      <Select
        size="small"
        value={rowsPerPage}
        onChange={(e) => { onRowsPerPageChange?.(Number(e.target.value)); onPageChange?.(1); }}
        sx={{
          fontSize: 12,
          height: 28,
          minWidth: 52,
          mr: 0.75,
          '& .MuiSelect-select': { py: '4px', pr: '24px !important' },
          '& fieldset': { borderColor: 'divider' },
        }}
      >
        {rowsPerPageOptions.map(opt => (
          <MenuItem key={opt} value={opt} sx={{ fontSize: 12 }}>{opt}</MenuItem>
        ))}
      </Select>

      {/* Previous */}
      <Button variant="outlined" size="small" disabled={page <= 1}
        onClick={() => onPageChange?.(page - 1)}
        startIcon={<ChevronLeftIcon sx={{ fontSize: 14, mr: -0.75 }} />}
        sx={{
          ...btn, height: 28, pl: 0.75, pr: 1,
          borderColor: 'divider',
          color: page <= 1 ? 'text.disabled' : 'primary.main',
          '&:hover': { borderColor: 'primary.main', bgcolor: 'transparent' },
          '&.Mui-disabled': { borderColor: 'divider' },
        }}
      >
        Previous
      </Button>

      {/* Page numbers */}
      {pageNumbers.map((p, idx) =>
        p === '...'
          ? <Typography key={`e-${idx}`} sx={{ fontSize: 12, color: 'text.secondary', px: 0.25, lineHeight: '28px', flexShrink: 0 }}>...</Typography>
          : (
            <Button key={p} size="small" onClick={() => onPageChange?.(p)}
              variant={p === page ? 'contained' : 'outlined'}
              sx={{
                ...btn, height: 28,
                borderColor: p === page ? 'primary.main' : 'divider',
                color: p === page ? '#fff' : 'primary.main',
                bgcolor: p === page ? 'primary.main' : 'transparent',
                '&:hover': {
                  bgcolor: p === page ? 'primary.dark' : (t) => t.palette.mode === 'dark' ? 'rgba(25,118,210,0.1)' : '#e3f2fd',
                  borderColor: 'primary.main',
                },
              }}
            >
              {p}
            </Button>
          )
      )}

      {/* Next */}
      <Button variant="outlined" size="small" disabled={page >= totalPages}
        onClick={() => onPageChange?.(page + 1)}
        endIcon={<ChevronRightIcon sx={{ fontSize: 14, ml: -0.75 }} />}
        sx={{
          ...btn, height: 28, pl: 1, pr: 0.75,
          borderColor: 'divider',
          color: page >= totalPages ? 'text.disabled' : 'primary.main',
          '&:hover': { borderColor: 'primary.main', bgcolor: 'transparent' },
          '&.Mui-disabled': { borderColor: 'divider' },
        }}
      >
        Next
      </Button>
    </Box>
  );
};

export default PaginationBar;
