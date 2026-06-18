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

  // Default to blue accent — matches dashboard primary color
  const categoryColor = data?.color || '#007aff';

  return (
    <>
      {/* Outer glow halo */}
      <path
        style={{
          ...style,
          stroke: categoryColor,
          strokeWidth: 6,
          filter: `drop-shadow(0 0 10px ${categoryColor}) drop-shadow(0 0 4px ${categoryColor})`,
          opacity: 0.18,
          fill: 'none',
        }}
        className="react-flow__edge-path"
        d={edgePath}
      />

      {/* Primary path — crisp and vivid */}
      <path
        style={{
          ...style,
          stroke: categoryColor,
          strokeWidth: 2,
          opacity: 0.85,
          fill: 'none',
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />

      {/* Animated glowing traveler dot */}
      <circle r="4" fill={categoryColor}>
        <animateMotion
          dur="2.5s"
          repeatCount="indefinite"
          path={edgePath}
          calcMode="spline"
          keySplines="0.4 0 0.2 1"
        />
        <style>{`
          circle {
            filter: drop-shadow(0 0 6px ${categoryColor}) drop-shadow(0 0 2px ${categoryColor});
            opacity: 0.9;
          }
        `}</style>
      </circle>
    </>
  );
}
