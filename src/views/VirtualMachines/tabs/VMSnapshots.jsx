import React from 'react';
import { Box, Typography } from '@mui/material';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';

const VMSnapshots = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <CameraAltOutlinedIcon sx={{ fontSize: 48, color: '#bdbdbd', mb: 1.5 }} />
    <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#757575', mb: 0.5 }}>
      Snapshots
    </Typography>
    <Typography sx={{ fontSize: 13, color: '#9e9e9e' }}>
      No snapshots available for this VM.
    </Typography>
  </Box>
);

export default VMSnapshots;
