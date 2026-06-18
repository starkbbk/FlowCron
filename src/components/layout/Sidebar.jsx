import React, { useState, memo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, GitBranch, Play, Activity, Settings,
  LogOut, Zap, ChevronLeft, ChevronRight
} from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import { useClerk } from '@clerk/clerk-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/workflows', icon: GitBranch, label: 'Workflows' },
  { path: '/executions', icon: Play, label: 'Executions' },
  { path: '/activity', icon: Activity, label: 'Activity' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const clerk = useClerk();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    document.documentElement.style.setProperty('--sidebar-width', next ? '88px' : '280px');
  };

  const handleLogout = async () => {
    try {
      if (clerk && clerk.signOut) {
        await clerk.signOut();
      }
    } catch (e) {
      console.error("Clerk signOut error:", e);
    }
    logout();
    navigate('/login');
  };

  return (
    <aside 
      className="fixed top-6 bottom-6 left-6 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 hidden lg:flex flex-col rounded-[24px] border border-white/[0.08]"
      style={{ 
        width: collapsed ? '88px' : '280px',
        background: 'rgba(255, 255, 255, 0.035)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.7), inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)',
        overflow: 'visible',
      }}
    >
      {/* Brand Section: Logo section padding: 24px */}
      <div 
        className="flex items-center shrink-0 overflow-hidden"
        style={{ 
          padding: '24px',
          justifyContent: collapsed ? 'center' : 'flex-start'
        }}
      >
        <div className="w-10 h-10 bg-gradient-to-tr from-[#2563EB] to-[#06B6D4] rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(37,99,235,0.4)] relative">
          <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse blur-[8px]" />
          <Zap size={20} className="text-white fill-white relative z-10" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-[22px] font-black text-white tracking-tighter whitespace-nowrap"
              style={{ marginLeft: '12px' }}
            >
              FlowCron
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Collapse Toggle */}
      <button
        onClick={toggleCollapse}
        className="text-white/60 hover:text-white transition-all shadow-2xl group border border-white/10 hover:border-white/20"
        style={{ 
          position: 'absolute', 
          right: '-18px', 
          top: '26px', 
          width: '36px', 
          height: '36px', 
          borderRadius: '10px', 
          backgroundColor: 'rgba(13, 13, 15, 0.85)', 
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999,
          cursor: 'pointer'
        }}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Primary Navigation: height 56px, pad-left/right 20px, icon gap 12px */}
      <nav 
        className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth"
        style={{ 
          marginLeft: '12px', 
          marginRight: '12px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px' 
        }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center rounded-xl transition-all duration-300 group relative font-semibold overflow-hidden
              ${isActive 
                ? 'bg-white/[0.07] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_0_20px_rgba(37,99,235,0.15)] border border-white/[0.08]' 
                : 'text-[#94a3b8] border border-transparent hover:bg-white/[0.03] hover:text-white'}
            `}
            style={{ 
              height: '56px',
              paddingLeft: collapsed ? '0' : '20px',
              paddingRight: collapsed ? '0' : '20px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: '12px', // Icon-to-text gap: 12px
            }}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-0 w-1 h-6 bg-gradient-to-b from-[#2563EB] to-[#06B6D4] rounded-r-full shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                  />
                )}
                <item.icon 
                  size={18} 
                  className={`shrink-0 transition-all duration-300 ${
                    isActive 
                      ? 'scale-110 text-white drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' 
                      : 'group-hover:scale-110 group-hover:text-white'
                  }`} 
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-[14px] tracking-tight whitespace-nowrap"
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

      {/* Sidebar Footer / Premium Account Card: padding 16px */}
      <div 
        className="border-t border-white/5"
        style={{ 
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div 
          className="flex items-center rounded-xl bg-white/[0.03] border border-white/[0.05] relative group overflow-hidden transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.1] backdrop-blur-md"
          style={{ 
            padding: collapsed ? '8px' : '16px', 
            justifyContent: collapsed ? 'center' : 'space-between' 
          }}
        >
          <div className="relative shrink-0 flex items-center justify-center">
            <div 
              className="rounded-lg bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 flex items-center justify-center text-white font-bold shadow-xl overflow-hidden"
              style={{ width: '36px', height: '36px', fontSize: '13px' }}
            >
              {user?.profile_image ? (
                <img src={user.profile_image} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            {/* Pulsing Active Indicator */}
            <span className="absolute bottom-[-2px] right-[-2px] block h-2.5 w-2.5 rounded-full ring-2 ring-[#050914] bg-[#22c55e] animate-pulse" />
          </div>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 min-w-0"
                style={{ marginLeft: '10px' }}
              >
                <div className="text-[13px] font-bold text-white truncate leading-tight">
                  {user?.username || user?.email?.split('@')[0]}
                </div>
                <div className="inline-flex items-center justify-center mt-1 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-[#2563EB]/20 to-[#06B6D4]/20 border border-[#06B6D4]/30 text-[9px] font-black uppercase text-[#06B6D4] tracking-wider scale-95 origin-left">
                   PRO MEMBER
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!collapsed && (
            <button 
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all shrink-0 cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default memo(Sidebar);
