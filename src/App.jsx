import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import ProtectedLayout from './components/layout/ProtectedLayout';

// Stores
import useAuthStore from './stores/authStore';

// Lazy Loaded Pages (Problem 6)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const WorkflowsListPage = lazy(() => import('./pages/WorkflowsListPage'));
const WorkflowEditorPage = lazy(() => import('./pages/WorkflowEditorPage'));
const ExecutionsListPage = lazy(() => import('./pages/ExecutionsListPage'));
const ExecutionDetailPage = lazy(() => import('./pages/ExecutionDetailPage'));
const ActivityLogPage = lazy(() => import('./pages/ActivityLogPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Midnight Carbon Loader
const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#09090b] z-[9999]">
    <div className="w-10 h-10 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#fafafa',
            border: '1px solid #27272a',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '500',
          },
        }}
      />
      
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="workflows" element={<WorkflowsListPage />} />
            <Route path="workflows/:id/edit" element={<WorkflowEditorPage />} />
            <Route path="executions" element={<ExecutionsListPage />} />
            <Route path="executions/:id" element={<ExecutionDetailPage />} />
            <Route path="activity" element={<ActivityLogPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
