import React from 'react';
import { Box, Typography } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import { useOutletContext } from 'react-router-dom';

const VMScaleConfig = () => {
  const { vmData } = useOutletContext() ?? {};

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <TuneIcon sx={{ fontSize: 22, color: '#1976d2' }} />
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>
          Scale Configuration
        </Typography>
      </Box>

      {vmData ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, maxWidth: 600 }}>
          {[
            { label: 'Min CPU', value: vmData.min_cpu },
            { label: 'Max CPU', value: vmData.max_cpu },
            { label: 'Min RAM (GB)', value: vmData.min_ram },
            { label: 'Max RAM (GB)', value: vmData.max_ram },
            { label: 'Total Disk (GB)', value: vmData.total_disk_size },
            { label: 'VM Count', value: vmData.vm_count },
          ].map(({ label, value }) => (
            <Box key={label} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1.5, bgcolor: '#fafafa' }}>
              <Typography sx={{ fontSize: 12, color: '#757575', mb: 0.5 }}>{label}</Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1976d2' }}>{value ?? '—'}</Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography sx={{ fontSize: 14, color: '#9e9e9e' }}>Loading...</Typography>
      )}
    </Box>
  );
};

export default VMScaleConfig;
