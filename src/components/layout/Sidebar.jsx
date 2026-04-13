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
      className="hidden md:flex flex-col fixed inset-y-0 left-0 h-screen bg-[#1e1e1e]/80 backdrop-blur-3xl border-r border-white/10 z-[100] transition-all duration-300 ease-in-out overflow-hidden shadow-2xl pl-4"
      style={{ width: 'var(--sidebar-width, 260px)' }}
    >
      {/* Brand Section */}
      <div className="p-6 py-8 flex items-center gap-6 shrink-0 overflow-hidden">
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
            >
              FlowCron
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar scroll-smooth pr-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group relative font-medium
              ${isActive ? 'bg-[#007aff] text-white shadow-md' : 'text-[#86868b] hover:bg-white/10 hover:text-white'}
            `}
          >
            <item.icon size={22} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="text-[17px] font-semibold whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 bg-transparent border-t border-white/10 space-y-3">
        <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/10 relative group overflow-hidden transition-all hover:bg-white/10 backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-[#2c2c2e] border border-white/10 flex items-center justify-center text-white font-bold text-[14px] shrink-0 shadow-inner">
            {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="flex-1 min-w-0"
              >
                <div className="text-[14px] font-bold text-white truncate">
                  {user?.username || user?.email?.split('@')[0]}
                </div>
                <div className="text-[12px] font-medium text-[#007aff] truncate mt-0.5">
                   Free Plan
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={handleLogout}
            className="p-2 rounded-xl text-[#86868b] hover:text-[#ff2d55] hover:bg-[#ff2d55]/10 transition-all shrink-0"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>

        <button
          onClick={toggleCollapse}
          className="w-full flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 text-[#86868b] hover:text-white transition-all hover:bg-white/10"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </aside>
  );
};

export default memo(Sidebar);
