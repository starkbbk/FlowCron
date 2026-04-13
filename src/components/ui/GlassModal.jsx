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

          {/* Midnight Carbon Modal Surface */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full bg-[#18181b] border border-[#27272a] rounded-[16px] overflow-hidden gpu-accel"
            style={{ maxWidth }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-2">
              <h3 className="text-[18px] font-semibold text-[#fafafa] tracking-tight">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 text-[#52525b] hover:text-[#fafafa] hover:bg-[#1f1f23] rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="space-y-6">
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default memo(GlassModal);
