import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { hideAlert } from './store/slices/alertSlice';
import useIdleTimeout from './hooks/useIdleTimeout';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './views/Auth/Login';
import Signup from './views/Auth/Signup';
import Dashboard from './views/Dashboard/Dashboard';

import PlatformList from './views/PasList/PlatformList';
import OverviewMain from './views/PasOverview/OverviewMain';
import Overview from './views/PasOverview/Overview';
import TaskList from './views/PasOverview/Tasks/TaskList';
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

// Insights module
import InsightHome from './views/Insight/InsightHome';

const ProtectedShell = ({ children }) => (
  <ProtectedRoute>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

function App() {
  const dispatch = useDispatch();
  const alert = useSelector((state) => state.alert);
  const token = useSelector((state) => state.auth.token);

  // Auto sign-out after 5 minutes of inactivity.
  useIdleTimeout();

  const handleCloseAlert = () => {
    dispatch(hideAlert());
  };

  return (
    <>
      <Routes>
        {/* Public auth routes — no Layout */}
        <Route path="/login"  element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/signup" element={token ? <Navigate to="/dashboard" replace /> : <Signup />} />

        {/* Protected app routes */}
        <Route path="/dashboard"         element={<ProtectedShell><Dashboard /></ProtectedShell>} />
        <Route path="/"                  element={<ProtectedShell><PlatformList /></ProtectedShell>} />
        <Route path="/compliances"       element={<ProtectedShell><ComplianceList /></ProtectedShell>} />
        <Route path="/compliances/create" element={<ProtectedShell><ComplianceService /></ProtectedShell>} />
        <Route path="/calendar"          element={<ProtectedShell><CalendarMain /></ProtectedShell>} />
        <Route path="/insights"          element={<ProtectedShell><InsightHome /></ProtectedShell>} />

        <Route path="/:id" element={<ProtectedShell><OverviewMain /></ProtectedShell>}>
          <Route path="overview"  element={<Overview />} />
          <Route path="instances" element={<TaskList />} />
          <Route index            element={<Overview />} />
        </Route>

        <Route path="/vms"     element={<ProtectedShell><VirtualMachines /></ProtectedShell>} />
        <Route path="/vms/:id" element={<ProtectedShell><VMDetailMain /></ProtectedShell>}>
          <Route index             element={<VMOverview />} />
          <Route path="disks"      element={<VMDisks />} />
          <Route path="vifs"       element={<VMVifs />} />
          <Route path="snapshots"  element={<VMSnapshots />} />
          <Route path="activity"   element={<VMActivityLogs />} />
          <Route path="scale"      element={<VMScaleConfig />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
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
    </>
  );
}

export default App;
