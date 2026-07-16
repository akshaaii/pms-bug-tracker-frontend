import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import BugsPage from './pages/BugsPage';
import KanbanPage from './pages/KanbanPage';
import TeamPage from './pages/TeamPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
/**
 * Application root.
 * Responsibilities:
 *   1. Wrap the entire tree in <AppProvider> (shared state & auth).
 *   2. Configure React Router with public (/login) and protected (/) routes.
 *   3. Delegate layout to <AppShell> and page content to individual page components.
 *
 * No business logic, no UI — this file is intentionally minimal.
 */
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes — AppShell handles auth guard & layout */}
          <Route path="/" element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="bugs"      element={<BugsPage />} />
            <Route path="tasks"     element={<KanbanPage />} />
            <Route path="team"      element={<TeamPage />} />
            <Route path="reports"   element={<ReportsPage />} />
            <Route path="settings"  element={<SettingsPage />} />
            <Route path="support"   element={<SupportPage />} />
          </Route>

          {/* Fallback — redirect unknown paths to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
