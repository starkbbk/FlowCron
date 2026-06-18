import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import ProtectedLayout from './components/layout/ProtectedLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import Background from './components/common/Background';

// Stores
import useAuthStore from './stores/authStore';

// Lazy Loaded Pages (Problem 6)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const WorkflowsListPage = lazy(() => import('./pages/WorkflowsListPage'));
const WorkflowEditorPage = lazy(() => import('./pages/WorkflowEditorPage'));
const ExecutionsListPage = lazy(() => import('./pages/ExecutionsListPage'));
const ExecutionDetailPage = lazy(() => import('./pages/ExecutionDetailPage'));
const ActivityLogPage = lazy(() => import('./pages/ActivityLogPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

import { useAuth, useUser } from '@clerk/clerk-react';
import api from './services/api';

// Sync Clerk authentication state to local Zustand store and backend database
const ClerkAuthSync = ({ children }) => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);
  const setIsLoading = useAuthStore((state) => state.setIsLoading);
  const setClerkTokenResolver = useAuthStore((state) => state.setClerkTokenResolver);

  useEffect(() => {
    if (!isLoaded) {
      setIsLoading(true);
      return;
    }

    // Register token resolver with Axios interceptor
    setClerkTokenResolver(getToken);

    const syncUser = async () => {
      if (isSignedIn && clerkUser) {
        try {
          const token = await getToken();
          // Sync with local backend database
          const res = await api.post('/auth/sync', {
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            username: clerkUser.username || clerkUser.firstName || 'user',
            profile_image: clerkUser.imageUrl || null
          });
          setAuth(res.data, token);
        } catch (error) {
          console.error('Failed to sync Clerk user with backend:', error);
          setIsLoading(false);
        }
      } else {
        logout();
        setIsLoading(false);
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, clerkUser, getToken, setAuth, logout, setIsLoading, setClerkTokenResolver]);

  return children;
};

// Midnight Carbon Loader
const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#09090b] z-[9999]">
    <div className="w-10 h-10 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <ClerkAuthSync>
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
        
        <ErrorBoundary>
          <Background />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

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
        </ErrorBoundary>
      </ClerkAuthSync>
    </BrowserRouter>
  );
}
