import React from 'react';
import { Box, Typography } from '@mui/material';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';

const InsightHome = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 2 }}>
    <LightbulbOutlinedIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
    <Typography variant="h6" sx={{ fontWeight: 500, color: 'text.secondary' }}>Insights</Typography>
    <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>Coming soon</Typography>
  </Box>
);

export default InsightHome;
