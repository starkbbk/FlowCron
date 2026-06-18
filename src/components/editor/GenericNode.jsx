import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { NODE_CATEGORIES, getNodeType } from '../../utils/nodeTypes';
import StatusBadge from '../common/StatusBadge';
import useWorkflowStore from '../../stores/workflowStore';

const GenericNode = ({ id, data, selected }) => {
  const nodeType = getNodeType(data.type);
  const category = NODE_CATEGORIES[nodeType?.category || 'action'] || NODE_CATEGORIES.action;
  
  // Failsafe icon resolution
  const Icon = Icons[nodeType?.icon] || Icons.Zap || Icons.Activity || (() => null);
  
  const execution = useWorkflowStore(state => state.nodeExecutions?.[id]);

  return (
    <div className={`relative group ${selected ? 'z-20' : 'z-10'} font-['Inter']`}>
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="w-[220px] overflow-hidden transition-all duration-300 relative rounded-2xl"
        style={{
          background: selected
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(255,255,255,0.055)',
          backdropFilter: 'blur(40px) saturate(160%)',
          WebkitBackdropFilter: 'blur(40px) saturate(160%)',
          border: selected
            ? `1px solid rgba(0,122,255,0.6)`
            : `1px solid rgba(255,255,255,0.1)`,
          boxShadow: selected
            ? `0 0 0 3px rgba(0,122,255,0.2), 0 20px 40px rgba(0,0,0,0.6), 0 0 30px rgba(0,122,255,0.15)`
            : `0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.06) inset`,
        }}
      >
        {/* Category top accent strip */}
        <div 
          className="absolute inset-x-0 top-0 pointer-events-none" 
          style={{ 
            height: '2px',
            background: `linear-gradient(to right, ${category.color}, transparent 70%)`,
          }} 
        />

        {/* Inner top glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.04) 0%, transparent 60%)',
            borderRadius: 'inherit',
          }}
        />

        <div className="p-5 space-y-3 relative z-10 flex flex-col items-center text-center">
          {/* Icon + execution badge */}
          <div className="flex items-center justify-center relative w-full">
            <div 
              className="flex items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
              style={{ 
                width: '48px', height: '48px',
                color: category.color,
                background: `linear-gradient(135deg, ${category.color}25, ${category.color}08)`,
                border: `1px solid ${category.color}35`,
                boxShadow: `inset 0 0 16px ${category.color}12, 0 4px 12px rgba(0,0,0,0.3), 0 0 0 1px ${category.color}10`,
              }}
            >
              <Icon size={22} strokeWidth={2.2} />
            </div>

            {/* Execution status badge */}
            {execution && (
              <div className="absolute right-0 top-0">
                <StatusBadge 
                  status={execution.status} 
                  size="small" 
                  className="scale-90 shadow-md" 
                />
              </div>
            )}
          </div>
          
          {/* Text */}
          <div className="w-full">
            <div className="font-extrabold text-white tracking-tight truncate" style={{ fontSize: '14px' }}>
              {nodeType?.name || data.label}
            </div>
            <div className="font-semibold truncate leading-relaxed" style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
              {data.config?.url || data.config?.topic || nodeType?.description || 'Workflow Step'}
            </div>
          </div>
        </div>
        
        {/* Running pulse overlay */}
        {execution?.status === 'running' && (
          <div 
            className="absolute inset-0 pointer-events-none animate-pulse" 
            style={{ background: `radial-gradient(circle at center, ${category.color}12 0%, transparent 70%)`, borderRadius: 'inherit' }}
          />
        )}
      </motion.div>

      {/* ── Connection Handles ─────────────────── */}
      
      {/* Target (left) */}
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{
          width: '14px', height: '14px',
          background: '#0d0f14',
          border: `2px solid rgba(255,255,255,0.2)`,
          borderRadius: '50%',
          left: '-7px',
          boxShadow: '0 0 8px rgba(255,255,255,0.1)',
          transition: 'all 0.2s ease',
        }}
      />
      
      {/* Source handles */}
      {data.type === 'if_condition' ? (
        <>
          <Handle 
            type="source" 
            position={Position.Right} 
            id="true"
            style={{
              width: '14px', height: '14px',
              background: '#34c759',
              border: '2px solid #0d0f14',
              borderRadius: '50%',
              right: '-7px', top: '40%',
              boxShadow: '0 0 12px rgba(52,199,89,0.5)',
            }}
          />
          <div
            className="absolute font-black uppercase"
            style={{ top: '32%', right: '-44px', fontSize: '9px', color: '#34c759', letterSpacing: '0.15em' }}
          >
            TRUE
          </div>
          
          <Handle 
            type="source" 
            position={Position.Bottom} 
            id="false"
            style={{
              width: '14px', height: '14px',
              background: '#ff3b30',
              border: '2px solid #0d0f14',
              borderRadius: '50%',
              bottom: '-7px', left: '50%',
              boxShadow: '0 0 12px rgba(255,59,48,0.5)',
            }}
          />
          <div
            className="absolute font-black uppercase"
            style={{ bottom: '-28px', left: '50%', transform: 'translateX(-50%)', fontSize: '9px', color: '#ff3b30', letterSpacing: '0.15em' }}
          >
            FALSE
          </div>
        </>
      ) : (
        <Handle 
          type="source" 
          position={Position.Right} 
          style={{
            width: '14px', height: '14px',
            background: category.color,
            border: '2px solid #0d0f14',
            borderRadius: '50%',
            right: '-7px',
            boxShadow: `0 0 12px ${category.color}80`,
          }}
        />
      )}
    </div>
  );
};

export default memo(GenericNode);
