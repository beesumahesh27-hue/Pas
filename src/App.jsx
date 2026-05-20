import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { hideAlert } from './store/slices/alertSlice';
import PlatformList from './views/PasList/PlatformList';
import OverviewMain from './views/PasOverview/OverviewMain';
import Overview from './views/PasOverview/Overview';
import TaskList from './views/PasOverview/Tasks/TaskList';
import Layout from './components/Layout';
import NotificationPoller from './components/NotificationPoller';
import ComplianceList    from './views/Compliance/ComplianceList';
import ComplianceService from './views/Compliance/ComplianceService';

// Virtual Machine module
import VirtualMachines from './views/PasOverview/Tasks/TaskList';
import VMDetailMain from './views/VirtualMachines/VMDetailMain';
import VMOverview from './views/VirtualMachines/tabs/VMOverview';
import VMDisks from './views/VirtualMachines/tabs/VMDisks';
import VMVifs from './views/VirtualMachines/tabs/VMVifs';
import VMSnapshots from './views/VirtualMachines/tabs/VMSnapshots';
import VMActivityLogs from './views/VirtualMachines/tabs/VMActivityLogs';
import VMScaleConfig from './views/VirtualMachines/tabs/VMScaleConfig';

// Calendar module
import CalendarMain from './views/Calendar/CalendarMain';

function App() {
  const dispatch = useDispatch();
  const alert = useSelector((state) => state.alert);

  const handleCloseAlert = () => {
    dispatch(hideAlert());
  };

  return (
    <Layout>
      <NotificationPoller />
      <Routes>
        <Route path="/" element={<PlatformList />} />
        <Route path="/compliances" element={<ComplianceList />} />
        <Route path="/compliances/create" element={<ComplianceService />} />
        <Route path="/:id" element={<OverviewMain />}>
          <Route path="overview" element={<Overview />} />
          <Route path="instances" element={<TaskList />} />
          <Route index element={<Overview />} />
        </Route>

        {/* Calendar route */}
        <Route path="/calendar" element={<CalendarMain />} />

        {/* Virtual Machine routes */}
        <Route path="/vms" element={<VirtualMachines />} />
        <Route path="/vms/:id" element={<VMDetailMain />}>
          <Route index element={<VMOverview />} />
          <Route path="disks" element={<VMDisks />} />
          <Route path="vifs" element={<VMVifs />} />
          <Route path="snapshots" element={<VMSnapshots />} />
          <Route path="activity" element={<VMActivityLogs />} />
          <Route path="scale" element={<VMScaleConfig />} />
        </Route>
      </Routes>

      {/* Global Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}

export default App;
