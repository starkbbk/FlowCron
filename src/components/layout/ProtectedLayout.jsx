import React, { memo } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import useAuthStore from '../../stores/authStore';

const ProtectedLayout = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#161618]">
        <div className="mac-os-wallpaper" />
        <div className="flex flex-col items-center gap-6 z-10 relative">
          <motion.div
            className="w-12 h-12 border-2 border-[#3a3a3c] border-t-[#007aff] rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
          <span className="text-[12px] font-medium uppercase tracking-[0.2em] text-[#86868b] animate-pulse">Initializing Data</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isEditorRoute = location.pathname.includes('/edit');

  return (
    <div className="min-h-screen relative bg-[#161618] selection:bg-[#007aff]/30 selection:text-white font-['Inter']">
      <div className="mac-os-wallpaper" />
      <Sidebar />
      <MobileNav />
      {/* 
          Main content area - Precise transitions
          Rule: 260px sidebar width
          Editor pages render full-bleed (no padding)
      */}
      <main
        className={`min-h-screen relative z-10 transition-all duration-300 ease-in-out ${isEditorRoute ? '' : 'pt-4 md:pt-12'}`}
        style={{ paddingLeft: isEditorRoute ? 'var(--sidebar-width)' : 'calc(var(--sidebar-width) + var(--sidebar-gap))' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            className={isEditorRoute ? 'gpu-accel' : 'pb-32 gpu-accel'}
            style={isEditorRoute ? {} : { paddingLeft: '5%', paddingRight: '5%' }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {isEditorRoute ? (
              <Outlet />
            ) : (
              <div 
                className="mx-auto overflow-visible"
                style={{ maxWidth: '1400px' }}
              >
                <Outlet />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default memo(ProtectedLayout);
