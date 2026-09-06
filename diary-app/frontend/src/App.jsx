import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import LockScreen from './pages/LockScreen.jsx';
import SetupScreen from './pages/SetupScreen.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EntryView from './pages/EntryView.jsx';
import EntryEditor from './pages/EntryEditor.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import AppLayout from './components/AppLayout.jsx';
import { api } from './utils/api.js';

// Guard: redirect visitor away from master-only routes
function MasterOnly({ children }) {
  const { isMaster } = useAuth();
  return isMaster ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  const { isAuthenticated, checking } = useAuth();
  const [setupNeeded, setSetupNeeded] = useState(null);
  const [setupLoading, setSetupLoading] = useState(true);

  useEffect(() => {
    api.setup.status()
      .then(({ setupNeeded }) => setSetupNeeded(setupNeeded))
      .catch(() => setSetupNeeded(false))
      .finally(() => setSetupLoading(false));
  }, []);

  if (checking || setupLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
  }

  if (setupNeeded) return <SetupScreen onComplete={() => setSetupNeeded(false)} />;
  if (!isAuthenticated) return <LockScreen />;

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/entry/:id" element={<EntryView />} />

        {/* Master-only routes */}
        <Route path="/entry/:id/edit" element={<MasterOnly><EntryEditor /></MasterOnly>} />
        <Route path="/entry/new" element={<MasterOnly><EntryEditor isNew /></MasterOnly>} />
        <Route path="/settings" element={<MasterOnly><SettingsPage /></MasterOnly>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
