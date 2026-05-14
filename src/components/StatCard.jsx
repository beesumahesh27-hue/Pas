import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

const StatCard = ({ label, value, icon, iconBg }) => (
  <Card
    variant="outlined"
    sx={{ bgcolor: '#fff', height: '100%', borderColor: '#e8e8e8' }}
  >
    <CardContent
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        py: 2.5,
        '&:last-child': { pb: 2.5 },
      }}
    >
      <Box>
        <Typography
          sx={{ fontSize: 13, color: '#616161', fontWeight: 400, mb: 0.75 }}
        >
          {label}
        </Typography>
        <Typography
          sx={{ fontSize: 30, fontWeight: 700, color: '#1a1a1a', lineHeight: 1 }}
        >
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          bgcolor: iconBg,
          borderRadius: 2,
          width: 54,
          height: 54,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
    </CardContent>
  </Card>
);

export default StatCard;
