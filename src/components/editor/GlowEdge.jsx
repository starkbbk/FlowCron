import React from 'react';
import { getBezierPath, BaseEdge } from '@xyflow/react';

export default function GlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const categoryColor = data?.color || '#007aff';

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          stroke: categoryColor,
          strokeWidth: 4,
          filter: `drop-shadow(0 0 8px ${categoryColor})`,
          opacity: 0.3,
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <path
        style={{
          ...style,
          stroke: categoryColor,
          strokeWidth: 2,
          opacity: 0.8,
        }}
        className="react-flow__edge-path"
        d={edgePath}
      />
      
      {/* Animated Glowing Dot Path */}
      <circle r="3" fill={categoryColor} className="edge-pulse-dot">
        <animateMotion
          dur="3s"
          repeatCount="indefinite"
          path={edgePath}
        />
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </circle>

      <style jsx>{`
        .edge-pulse-dot {
          filter: drop-shadow(0 0 5px ${categoryColor});
          opacity: 0.8;
        }
      `}</style>
    </>
  );
}
