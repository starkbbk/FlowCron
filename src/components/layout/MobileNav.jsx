import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, GitBranch, Play, 
  Activity, Settings 
} from 'lucide-react';

const items = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dash' },
  { path: '/workflows', icon: GitBranch, label: 'Workflows' },
  { path: '/executions', icon: Play, label: 'Execs' },
  { path: '/activity', icon: Activity, label: 'Activity' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const MobileNav = () => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 md:hidden flex items-center justify-around bg-[#111113] z-50 border-t border-[#27272a] pb-[env(safe-area-inset-bottom)] pt-4 px-2 shadow-none gpu-accel"
    >
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
              isActive 
                ? 'text-[#3b82f6] bg-[#3b82f610]' 
                : 'text-[#71717a]'
            }`
          }
        >
          <item.icon size={18} className="transition-transform duration-200" />
          <span className="text-[10px] font-semibold tracking-tight">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default memo(MobileNav);
