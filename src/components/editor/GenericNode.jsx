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
  
  // Failsafe icon resolution: check Icons object, fallback to Zap, then Activity
  const Icon = Icons[nodeType?.icon] || Icons.Zap || Icons.Activity || (() => null);
  
  const execution = useWorkflowStore(state => state.nodeExecutions?.[id]);

  return (
    <div className={`relative group ${selected ? 'z-20' : 'z-10'} gpu-accel font-['Inter']`}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 320 }}
        className={`
          w-[250px] overflow-hidden transition-all duration-300 relative rounded-2xl border
          ${selected 
            ? 'border-[#0a84ff] shadow-[0_0_25px_rgba(10,132,255,0.35),0_20px_40px_rgba(0,0,0,0.6)]' 
            : 'border-white/[0.08] hover:border-white/20 shadow-2xl hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)]'
          }
        `}
        style={{
          background: `rgba(255, 255, 255, 0.045)`,
          backdropFilter: 'blur(32px) saturate(140%)',
          WebkitBackdropFilter: 'blur(32px) saturate(140%)',
        }}
      >
        {/* Category top lighting strip */}
        <div 
          className="absolute inset-x-0 top-0 h-[3px] pointer-events-none" 
          style={{ 
            background: `linear-gradient(to right, ${category.color}, transparent)`,
          }} 
        />

        <div className="p-5 space-y-4 relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center justify-center relative w-full">
             <div 
                className="flex items-center justify-center rounded-xl w-12 h-12 border border-white/10 group-hover:scale-105 transition-transform duration-300" 
                style={{ 
                  color: category.color,
                  background: `linear-gradient(135deg, ${category.color}20, ${category.color}05)`,
                  boxShadow: `inset 0 0 12px ${category.color}15, 0 4px 12px rgba(0,0,0,0.2)`
                }}
             >
                <Icon size={22} strokeWidth={2.2} />
             </div>
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
          
          <div className="w-full">
            <div className="font-extrabold text-[15px] text-white tracking-tight truncate">
              {nodeType?.name || data.label}
            </div>
             <div className="text-[12px] text-[#94a3b8] font-bold truncate leading-relaxed mt-1 opacity-90">
                {data.config?.url || data.config?.topic || nodeType?.description || 'Workflow Step'}
             </div>
          </div>
        </div>
        
        {execution?.status === 'running' && (
          <div 
            className="absolute inset-0 pointer-events-none animate-pulse" 
            style={{ background: `radial-gradient(circle at center, ${category.color}10 0%, transparent 70%)` }}
          />
        )}
      </motion.div>

      {/* Glowing Connection Ports */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!w-5 !h-5 !bg-[#1c1c1e] !border-2 !border-white/20 !rounded-full !left-[-10px] transition-all hover:!scale-125 shadow-[0_0_10px_rgba(255,255,255,0.1)]"
        style={{ borderColor: 'rgba(255,255,255,0.2)' }}
      />
      
      {data.type === 'if_condition' ? (
        <>
          <Handle 
            type="source" 
            position={Position.Right} 
            id="true"
            className="!w-5 !h-5 !bg-[#34c759] !border-2 !border-[#0d0d0f] !rounded-full !right-[-10px] !top-[40%] hover:!scale-125 transition-transform shadow-[0_0_15px_rgba(52,199,89,0.4)]"
          />
          <div className="absolute top-[34%] -right-16 text-[10px] font-black text-[#34c759] uppercase tracking-[0.2em] drop-shadow-sm">TRUE</div>
          
          <Handle 
            type="source" 
            position={Position.Bottom} 
            id="false"
            className="!w-5 !h-5 !bg-[#ff2d55] !border-2 !border-[#0d0d0f] !rounded-full !bottom-[-10px] !left-1/2 hover:!scale-125 transition-transform shadow-[0_0_15px_rgba(255,45,85,0.4)]"
          />
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-black text-[#ff2d55] uppercase tracking-[0.2em] drop-shadow-sm">FALSE</div>
        </>
      ) : (
        <Handle 
          type="source" 
          position={Position.Right} 
          className="!w-5 !h-5 !bg-[#007aff] !border-2 !border-[#0d0d0f] !rounded-full !right-[-10px] transition-all hover:!scale-125 shadow-[0_0_15px_rgba(0,122,255,0.4)]"
          style={{ backgroundColor: category.color }}
        />
      )}
    </div>
  );
};

export default memo(GenericNode);
