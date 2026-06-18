import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const GlassModal = ({ isOpen, onClose, title, children, maxWidth = '480px' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 overflow-hidden">
          {/* Flat Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute inset-0 bg-black/60 gpu-accel"
            onClick={onClose}
          />

          {/* Frosted Glass Modal Surface */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full bg-white/[0.045] backdrop-blur-3xl border border-white/[0.08] rounded-[32px] overflow-hidden shadow-2xl gpu-accel"
            style={{ 
              maxWidth, 
              boxShadow: '0 40px 100px -15px rgba(0, 0, 0, 0.7), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)' 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: padding 32px (32px left/right, 32px top, 24px bottom) */}
            <div className="flex items-center justify-between" style={{ padding: '32px 32px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="font-bold text-white tracking-tight" style={{ fontSize: '22px' }}>{title}</h3>
              <button
                onClick={onClose}
                className="text-[#86868b] hover:text-white hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer"
                style={{ width: '36px', height: '36px', borderRadius: '12px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content: padding: 32px, gap: 24px */}
            <div className="max-h-[80vh] overflow-y-auto" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default memo(GlassModal);
