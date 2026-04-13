import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

const getStatusConfig = (status) => {
  const s = status?.toLowerCase();
  switch (s) {
    case 'active':
    case 'running':
    case 'completed': 
      return { 
        color: 'text-[#10b981]', 
        bg: 'bg-[#10b98110]', 
        border: 'border-[#10b98120]' 
      };
    case 'failed':
    case 'error': 
      return { 
        color: 'text-[#ef4444]', 
        bg: 'bg-[#ef444410]', 
        border: 'border-[#ef444420]' 
      };
    case 'warning':
    case 'paused':
    case 'pending':
      return { 
        color: 'text-[#f59e0b]', 
        bg: 'bg-[#f59e0b10]', 
        border: 'border-[#f59e0b20]' 
      };
    default: 
      return { 
        color: 'text-[#71717a]', 
        bg: 'bg-[#18181b]', 
        border: 'border-[#27272a]' 
      };
  }
};

const StatusBadge = ({ status, size = 'default', className = '' }) => {
  const config = useMemo(() => getStatusConfig(status), [status]);
  const isRunning = status === 'active' || status === 'running';
  
  const sizes = {
    small: 'text-[10px] px-2.5 py-0.5',
    default: 'text-[11px] px-3 py-1',
  };
  
  const sizeClass = sizes[size] || sizes.default;

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 rounded-full border
        font-semibold uppercase tracking-tight transition-all duration-200
        ${config.color} ${config.bg} ${config.border} ${sizeClass} ${className}
      `}
    >
      <motion.span
        className="w-1.5 h-1.5 rounded-full bg-current"
        animate={isRunning ? { 
          scale: [1, 1.25, 1], 
          opacity: [1, 0.5, 1]
        } : {}}
        transition={isRunning ? { 
          duration: 1.5, 
          repeat: Infinity, 
          ease: 'easeInOut' 
        } : {}}
      />
      {status}
    </div>
  );
};

export default memo(StatusBadge);

export default memo(StatusBadge);
