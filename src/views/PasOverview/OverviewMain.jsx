import React, { useEffect, useState } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../../services/api';

const OverviewMain = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [platformData, setPlatformData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/platforms/${id}`)
      .then(({ data }) => setPlatformData(data))
      .catch(() => setPlatformData(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!platformData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          Platform not found
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          variant="contained"
        >
          Back to Platforms
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Outlet context={{ platformData }} />
    </Box>
  );
};

export default OverviewMain;
