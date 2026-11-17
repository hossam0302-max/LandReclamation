import { useEffect, useState, type ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AppProvider, useApp } from './context/AppContext';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { NaamaLoginPage } from './pages/naama/NaamaLoginPage';
import { NaamaServiceDetailsPage } from './pages/naama/NaamaServiceDetailsPage';
import { NaamaServicesPage } from './pages/naama/NaamaServicesPage';
import { RequestDetailPage } from './pages/RequestDetailPage';
import { RequestFormPage } from './pages/RequestFormPage';
import {
  ADMIN_LOGOUT_PATH,
  consumePendingLogoutPath,
} from './logoutRedirect';

function LoggedOutRedirect() {
  const [path] = useState(consumePendingLogoutPath);
  useEffect(() => {
    if (path !== ADMIN_LOGOUT_PATH) return;
    window.location.assign(new URL(ADMIN_LOGOUT_PATH, window.location.href).href);
  }, [path]);

  if (path === ADMIN_LOGOUT_PATH) return null;
  return <Navigate to={path} replace />;
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currentUser } = useApp();
  if (!currentUser) return <LoggedOutRedirect />;
  return children;
}

function AppRoutes() {
  const { currentUser } = useApp();

  return (
    <Routes>
      <Route path="/" element={<NaamaServicesPage />} />
      <Route path="/account/login" element={<NaamaLoginPage />} />
      <Route path="/services/details" element={<NaamaServiceDetailsPage />} />
      <Route element={<Layout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/app"
          element={
            currentUser ? (
              <DashboardPage />
            ) : (
              <LoggedOutRedirect />
            )
          }
        />
        <Route
          path="/requests/new"
          element={
            <ProtectedRoute>
              <RequestFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests/:id"
          element={
            <ProtectedRoute>
              <RequestDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests/:id/edit"
          element={
            <ProtectedRoute>
              <RequestFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests/:id/view"
          element={
            <ProtectedRoute>
              <RequestFormPage readOnly />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <Navigate to={currentUser ? '/app' : '/login'} replace />
          }
        />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
}
