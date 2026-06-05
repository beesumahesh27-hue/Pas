import React from 'react';
import { Button } from '@mui/material';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';

/**
 * Reusable refresh button — keeps the refresh action visually consistent
 * across every page. Matches the canonical text-button style used by the
 * Task, Compliance and Platform list pages.
 *
 * Props:
 *   onClick  – refresh handler
 *   loading  – when true, disables the button and spins the icon
 *   label    – button text (default "Refresh")
 *   sx       – style overrides merged onto the button
 */
const RefreshButton = ({ onClick, loading = false, label = 'Refresh', sx = {}, ...rest }) => (
  <Button
    variant="text"
    onClick={onClick}
    disabled={loading}
    startIcon={
      <RefreshOutlinedIcon
        sx={{
          fontSize: 17,
          animation: loading ? 'refresh-spin 0.8s linear infinite' : 'none',
          '@keyframes refresh-spin': {
            from: { transform: 'rotate(0deg)' },
            to:   { transform: 'rotate(360deg)' },
          },
        }}
      />
    }
    sx={{ textTransform: 'none', color: '#424242', fontSize: 14, fontWeight: 400, minWidth: 0, ...sx }}
    {...rest}
  >
    {label}
  </Button>
);

export default RefreshButton;
