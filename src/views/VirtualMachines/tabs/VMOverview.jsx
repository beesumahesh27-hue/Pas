import React, { useState } from 'react';
import {
  Box,
  Chip,
  Divider,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';

const SectionTitle = ({ children }) => (
  <Typography
    sx={{ fontSize: 13, fontWeight: 700, color: '#1976d2', mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}
  >
    {children}
  </Typography>
);

const InfoRow = ({ label, value, chip }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.25, gap: 1 }}>
    <Typography sx={{ fontSize: 13, color: '#757575', minWidth: 160, flexShrink: 0 }}>
      {label}
    </Typography>
    {chip ? (
      <Chip
        label={value ?? '—'}
        size="small"
        sx={{
          bgcolor: value === 'Running' ? '#e8f5e9' : value === 'Halted' ? '#ffebee' : '#f5f5f5',
          color: value === 'Running' ? '#2e7d32' : value === 'Halted' ? '#c62828' : '#424242',
          fontWeight: 600,
          fontSize: 12,
          height: 22,
        }}
      />
    ) : (
      <Typography sx={{ fontSize: 13, color: '#212121', wordBreak: 'break-all' }}>
        {value ?? '—'}
      </Typography>
    )}
  </Box>
);

const PROP_TABS = ['Properties', 'Monitoring', 'Insight Monitoring', 'Alerts'];

const VMOverview = () => {
  const { vmData } = useOutletContext() ?? {};
  const [propTab, setPropTab] = useState(0);

  if (!vmData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography sx={{ fontSize: 14, color: '#9e9e9e' }}>Loading VM details...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>

      {/* ── Summary ── */}
      <Box sx={{ mb: 3 }}>
        <SectionTitle>Summary</SectionTitle>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          {/* Left col */}
          <Box>
            <InfoRow label="VM Name"         value={vmData.vm_name} />
            <InfoRow label="Additional Name"  value={vmData.additional_name} />
            <InfoRow label="VM UUID"          value={vmData.vm_uuid} />
            <InfoRow label="Type"             value={vmData.type} />
          </Box>
          {/* Right col */}
          <Box>
            <InfoRow label="Compute"          value={vmData.compute} />
            <InfoRow label="Primary IP"       value={vmData.primary_ip} />
            <InfoRow label="Power State"      value={vmData.power_state} chip />
            <InfoRow label="Encryption"       value={vmData.encryption} />
            <InfoRow label="Subnet"           value={vmData.subnet} />
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      {/* ── Properties / Monitoring tabs ── */}
      <Box>
        <Tabs
          value={propTab}
          onChange={(_, v) => setPropTab(v)}
          sx={{
            minHeight: 34,
            mb: 2,
            '& .MuiTab-root': { textTransform: 'none', fontSize: 13, minHeight: 34, py: 0.5, px: 2 },
            '& .Mui-selected': { color: '#1976d2', fontWeight: 600 },
            '& .MuiTabs-indicator': { bgcolor: '#1976d2' },
          }}
        >
          {PROP_TABS.map((t) => <Tab key={t} label={t} />)}
        </Tabs>

        {propTab === 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {/* Properties section */}
            <Box>
              <SectionTitle>Properties</SectionTitle>
              <InfoRow label="Compute Name"  value={vmData.compute} />
              <InfoRow label="Power State"   value={vmData.power_state} chip />
              <InfoRow label="POD"           value={vmData.cloud_pod} />
              <InfoRow label="Compute"       value={vmData.compute} />
              <InfoRow label="Encryption"    value={vmData.encryption} />
              <InfoRow label="Guest OS"      value={vmData.guest_os} />
              <InfoRow label="Min CPU"       value={vmData.min_cpu} />
              <InfoRow label="Max CPU"       value={vmData.max_cpu} />
              <InfoRow label="Min RAM (GB)"  value={vmData.min_ram} />
              <InfoRow label="Max RAM (GB)"  value={vmData.max_ram} />
              <InfoRow label="Total Disk (GB)" value={vmData.total_disk_size} />
              <InfoRow label="Region"        value={vmData.region} />
            </Box>

            {/* Network section */}
            <Box>
              <SectionTitle>Network</SectionTitle>
              <InfoRow label="Private IP Address" value={vmData.primary_ip} />
              <InfoRow label="Network"             value={vmData.network} />
              <InfoRow label="VLAN"                value={vmData.vlan} />
              <InfoRow label="Subnet"              value={vmData.subnet} />
              <InfoRow label="Gateway"             value={vmData.gateway} />
            </Box>
          </Box>
        )}

        {propTab === 1 && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography sx={{ fontSize: 14, color: '#9e9e9e' }}>
              Monitoring data not available.
            </Typography>
          </Box>
        )}

        {propTab === 2 && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography sx={{ fontSize: 14, color: '#9e9e9e' }}>
              Insight Monitoring data not available.
            </Typography>
          </Box>
        )}

        {propTab === 3 && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography sx={{ fontSize: 14, color: '#9e9e9e' }}>
              No active alerts.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default VMOverview;
