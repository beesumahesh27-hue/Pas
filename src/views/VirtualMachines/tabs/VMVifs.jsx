import React from 'react';
import { Box, Typography } from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';

const VMVifs = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <WifiIcon sx={{ fontSize: 48, color: '#bdbdbd', mb: 1.5 }} />
    <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#757575', mb: 0.5 }}>
      Virtual Interfaces (VIF's)
    </Typography>
    <Typography sx={{ fontSize: 13, color: '#9e9e9e' }}>
      No virtual interfaces configured for this VM.
    </Typography>
  </Box>
);

export default VMVifs;
