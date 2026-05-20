import React, { useCallback, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useOutletContext } from 'react-router-dom';
import api from '../../../services/api';

const EVENT_COLORS = {
  create: { bg: '#e8f5e9', color: '#2e7d32' },
  status: { bg: '#e3f2fd', color: '#1565c0' },
  config: { bg: '#fff8e1', color: '#e65100' },
  default: { bg: '#f5f5f5', color: '#424242' },
};

const VMActivityLogs = () => {
  const { vmId } = useOutletContext() ?? {};
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(() => {
    if (!vmId) return;
    setLoading(true);
    api.get(`/vms/${vmId}/activity`)
      .then(({ data }) => setLogs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [vmId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatTs = (ts) => {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return ts;
    }
  };

  return (
    <Box sx={{ p: 2.5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a' }}>
          Activity Logs
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon sx={{ fontSize: 15 }} />}
          onClick={fetchLogs}
          disabled={loading}
          sx={{ textTransform: 'none', fontSize: 13, borderColor: '#c8c8c8', color: '#424242' }}
        >
          Refresh
        </Button>
      </Box>

      {/* Timeline */}
      {loading ? (
        <Typography sx={{ fontSize: 14, color: '#9e9e9e' }}>Loading...</Typography>
      ) : logs.length === 0 ? (
        <Typography sx={{ fontSize: 14, color: '#9e9e9e', py: 4, textAlign: 'center' }}>
          No activity logs found.
        </Typography>
      ) : (
        <Box sx={{ position: 'relative' }}>
          {/* Vertical line */}
          <Box sx={{
            position: 'absolute', left: 12, top: 8, bottom: 8,
            width: 2, bgcolor: '#e0e0e0',
          }} />
          {logs.map((log, idx) => {
            const style = EVENT_COLORS[log.type] ?? EVENT_COLORS.default;
            return (
              <Box
                key={idx}
                sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2, position: 'relative' }}
              >
                {/* Dot */}
                <Box sx={{
                  width: 26, height: 26, borderRadius: '50%', bgcolor: style.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, zIndex: 1,
                }}>
                  <FiberManualRecordIcon sx={{ fontSize: 12, color: style.color }} />
                </Box>

                {/* Content */}
                <Box sx={{
                  flex: 1,
                  bgcolor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: 1.5,
                  p: 1.5,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>
                      {log.event}
                    </Typography>
                    <Chip
                      label={log.type}
                      size="small"
                      sx={{ bgcolor: style.bg, color: style.color, fontWeight: 600, fontSize: 11, height: 20 }}
                    />
                  </Box>
                  <Typography sx={{ fontSize: 12, color: '#757575' }}>
                    {formatTs(log.timestamp)}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default VMActivityLogs;
