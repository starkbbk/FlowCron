import React, { useState, memo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, GitBranch, Play, Activity, Settings,
  LogOut, Zap, ChevronLeft, ChevronRight
} from 'lucide-react';
import useAuthStore from '../../stores/authStore';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/workflows', icon: GitBranch, label: 'Workflows' },
  { path: '/executions', icon: Play, label: 'Executions' },
  { path: '/activity', icon: Activity, label: 'Activity' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    document.documentElement.style.setProperty('--sidebar-width', next ? '80px' : '260px');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside 
      className="fixed top-0 bottom-0 left-0 bg-[#1c1c1e]/80 backdrop-blur-2xl border-r border-white/5 z-50 transition-all duration-300 ease-in-out shrink-0 flex flex-col shadow-2xl overflow-visible"
      style={{ 
        width: 'var(--sidebar-width, 260px)',
        overflow: 'visible'
      }}
    >
      {/* Brand Section */}
      <div 
        className="flex items-center justify-center shrink-0 overflow-hidden"
        style={{ marginLeft: collapsed ? '12px' : '24px', marginRight: collapsed ? '12px' : '24px', marginTop: '40px', marginBottom: '32px' }}
      >
        <div className="w-10 h-10 bg-gradient-to-tr from-[#007aff] to-[#34c759] rounded-xl flex items-center justify-center shrink-0 shadow-lg mt-1">
          <Zap size={20} className="text-white fill-white translate-y-[1px]" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="text-[24px] font-extrabold text-white tracking-tight whitespace-nowrap mt-1"
              style={{ marginLeft: '20px' }}
            >
              FlowCron
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Collapse Toggle */}
      <button
        onClick={toggleCollapse}
        className="text-[#86868b] hover:text-white hover:bg-[#007aff] transition-all shadow-xl group"
        style={{ 
          position: 'absolute', 
          right: '-24px', 
          top: '50%', 
          transform: 'translateY(-50%)',
          width: '48px', 
          height: '48px', 
          borderRadius: '50%', 
          backgroundColor: '#2c2c2e', 
          border: '1px solid rgba(255,255,255,0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999,
          cursor: 'pointer'
        }}
      >
        {collapsed ? <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform text-white/70 group-hover:text-white" /> : <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform text-white/70 group-hover:text-white" />}
      </button>

      {/* Primary Navigation */}
      <nav 
        className="flex-1 overflow-y-auto no-scrollbar scroll-smooth"
        style={{ marginLeft: collapsed ? '12px' : '24px', marginRight: collapsed ? '12px' : '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center rounded-2xl transition-all duration-200 group relative font-medium
              ${isActive ? 'bg-[#007aff] text-white shadow-md' : 'text-[#86868b] hover:bg-white/10 hover:text-white'}
            `}
            style={{ 
              paddingTop: '16px', 
              paddingBottom: '16px', 
              paddingLeft: collapsed ? '16px' : '24px', 
              paddingRight: collapsed ? '16px' : '24px',
              justifyContent: collapsed ? 'center' : 'flex-start'
            }}
          >
            <item.icon size={22} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="text-[17px] font-semibold whitespace-nowrap"
                  style={{ marginLeft: '16px' }}
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div 
        className="bg-transparent border-t border-white/10"
        style={{ 
          marginLeft: collapsed ? '12px' : '24px', 
          marginRight: collapsed ? '12px' : '24px', 
          paddingTop: '32px', 
          paddingBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <div 
          className="flex items-center rounded-2xl bg-white/5 border border-white/10 relative group overflow-hidden transition-all hover:bg-white/10 backdrop-blur-md"
          style={{ padding: collapsed ? '12px' : '20px', justifyContent: collapsed ? 'center' : 'space-between' }}
        >
          <div 
            className="rounded-xl bg-[#2c2c2e] border border-white/10 flex items-center justify-center text-white font-bold shrink-0 shadow-inner"
            style={{ width: '48px', height: '48px', fontSize: '18px' }}
          >
            {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="flex-1 min-w-0"
                style={{ marginLeft: '16px' }}
              >
                <div className="text-[17px] font-bold text-white truncate">
                  {user?.username || user?.email?.split('@')[0]}
                </div>
                <div className="text-[14px] font-medium text-[#007aff] truncate mt-1">
                   Free Plan
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={handleLogout}
            className="rounded-xl text-[#86868b] hover:text-[#ff2d55] hover:bg-[#ff2d55]/10 transition-all shrink-0"
            title="Sign Out"
            style={{ padding: '12px' }}
          >
            <LogOut size={24} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default memo(Sidebar);
