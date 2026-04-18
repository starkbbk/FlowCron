import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { NODE_CATEGORIES, getNodeType } from '../../utils/nodeTypes';
import StatusBadge from '../common/StatusBadge';
import useWorkflowStore from '../../stores/workflowStore';

const GenericNode = ({ id, data, selected }) => {
  const nodeType = getNodeType(data.type);
  const category = NODE_CATEGORIES[nodeType?.category || 'action'];
  const Icon = Icons[nodeType?.icon || 'Zap'];
  
  const execution = useWorkflowStore(state => state.nodeExecutions[id]);

  return (
    <div className={`relative group ${selected ? 'z-20' : 'z-10'} gpu-accel font-['Inter']`}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className={`
          w-[320px] mac-bento-card overflow-hidden transition-all duration-500 relative
          ${selected 
            ? 'shadow-[0_0_0_2px_#007aff,_0_30px_60px_rgba(0,0,0,0.6)]' 
            : 'shadow-2xl hover:border-white/20'
          }
        `}
        style={{
          background: `linear-gradient(135deg, rgba(44, 44, 48, 0.4) 0%, rgba(28, 28, 30, 0.2) 100%)`,
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
        }}
      >
        {/* Category Inner Glow Signature */}
        <div 
          className="absolute inset-x-0 top-0 h-[100px] pointer-events-none opacity-20" 
          style={{ 
            background: `linear-gradient(to bottom, ${category.color} 0%, transparent 100%)`,
          }} 
        />

        <div className="p-6 space-y-6 relative z-10">
          <div className="flex items-center justify-between">
             <div 
                className="flex items-center justify-center rounded-2xl w-14 h-14 bg-white/5 border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500" 
                style={{ 
                  color: category.color,
                  boxShadow: `inset 0 0 20px ${category.color}20, 0 0 15px ${category.color}30`
                }}
             >
                <Icon size={26} strokeWidth={2.2} />
             </div>
             {execution && (
                <StatusBadge 
                  status={execution.status} 
                  size="small" 
                  className="scale-90 origin-right shadow-lg" 
                />
             )}
          </div>
          
          <div className="space-y-2">
            <div className="font-extrabold text-[18px] text-white tracking-tight truncate">
              {nodeType?.name || data.label}
            </div>
             <div className="text-[14px] text-[#86868b] font-medium truncate leading-relaxed">
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
