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
      className="fixed top-6 bottom-6 left-6 bg-white/5 backdrop-blur-[40px] border border-white/10 z-50 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] shrink-0 hidden lg:flex flex-col shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] rounded-[32px] overflow-visible"
      style={{ 
        width: 'var(--sidebar-width, 260px)',
        overflow: 'visible',
      }}
    >
      {/* Brand Section */}
      <div 
        className="flex items-center justify-center shrink-0 overflow-hidden"
        style={{ marginLeft: collapsed ? '12px' : '24px', marginRight: collapsed ? '12px' : '24px', marginTop: '40px', marginBottom: '32px' }}
      >
        <div className="w-11 h-11 bg-gradient-to-tr from-[#007aff] to-[#34c759] rounded-2xl flex items-center justify-center shrink-0 shadow-[0_4px_20px_rgba(0,122,255,0.4)] relative">
          <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse blur-[10px]" />
          <Zap size={22} className="text-white fill-white relative z-10" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-[26px] font-black text-white tracking-tighter whitespace-nowrap"
              style={{ marginLeft: '16px' }}
            >
              FlowCron
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Collapse Toggle */}
      <button
        onClick={toggleCollapse}
        className="text-white/60 hover:text-white transition-all shadow-2xl group border border-white/10"
        style={{ 
          position: 'absolute', 
          right: '-20px', 
          top: '60px', 
          width: '40px', 
          height: '40px', 
          borderRadius: '12px', 
          backgroundColor: 'rgba(44, 44, 48, 0.8)', 
          backdropFilter: 'blur(20px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999,
          cursor: 'pointer'
        }}
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Primary Navigation */}
      <nav 
        className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth"
        style={{ marginLeft: '12px', marginRight: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center rounded-2xl transition-all duration-500 group relative font-bold overflow-hidden
              ${isActive 
                ? 'bg-white/10 text-[#007aff] shadow-inner' 
                : 'text-[#86868b] hover:bg-white/5 hover:text-white'}
            `}
            style={({ isActive }) => ({ 
              height: '56px',
              paddingLeft: collapsed ? '0' : '20px',
              justifyContent: collapsed ? 'center' : 'flex-start',
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-0 w-1 h-6 bg-[#007aff] rounded-r-full shadow-[0_0_15px_#007aff]"
                  />
                )}
                <item.icon size={22} className={`shrink-0 transition-all duration-500 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(0,122,255,0.6)]' : 'group-hover:scale-110'}`} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-[15px] tracking-tight whitespace-nowrap"
                      style={{ marginLeft: '16px' }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div 
        className="p-4 border-t border-white/5"
        style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div 
          className="flex items-center rounded-2xl bg-white/5 border border-white/5 relative group overflow-hidden transition-all hover:bg-white/10 backdrop-blur-md"
          style={{ padding: collapsed ? '8px' : '14px', justifyContent: collapsed ? 'center' : 'space-between' }}
        >
          <div 
            className="rounded-xl bg-gradient-to-br from-[#1c1c1e] to-[#0d0d0f] border border-white/10 flex items-center justify-center text-white font-bold shrink-0 shadow-2xl"
            style={{ width: '40px', height: '40px', fontSize: '15px' }}
          >
            {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 min-w-0"
                style={{ marginLeft: '12px' }}
              >
                <div className="text-[14px] font-bold text-white truncate">
                  {user?.username || user?.email?.split('@')[0]}
                </div>
                <div className="text-[11px] font-black text-[#007aff] uppercase tracking-widest mt-0.5 opacity-80">
                   Premium
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={handleLogout}
            className="p-2.5 rounded-xl text-[#86868b] hover:text-[#ff2d55] hover:bg-[#ff2d55]/10 transition-all shrink-0"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default memo(Sidebar);
