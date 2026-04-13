import { motion } from 'framer-motion'

const variants = {
  default: { backgroundColor: '#18181b', border: '1px solid #27272a' },
  strong: { backgroundColor: '#111113', border: '1px solid #27272a' },
  subtle: { backgroundColor: '#1f1f23', border: '1px solid #27272a' },
}

const paddingPresets = {
  none: 'p-0',
  compact: 'p-6',
  standard: 'p-8',
  large: 'p-10',
}

export default function GlassCard({
  children,
  variant = 'default',
  padding = 'standard',
  className = '',
  hover = true,
  onClick,
  animate = true,
  ...props
}) {
  const Component = animate ? motion.div : 'div'
  
  const animateProps = animate
    ? {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.2, ease: 'easeOut' },
        whileHover: hover ? { 
          borderColor: '#3f3f46',
          backgroundColor: variant === 'strong' ? '#18181b' : '#1f1f23',
          transition: { duration: 0.15 } 
        } : undefined,
      }
    : {}

  return (
    <Component
      className={`${paddingPresets[padding]} ${className}`}
      onClick={onClick}
      style={{ 
        ...variants[variant],
        borderRadius: '12px',
        position: 'relative', 
        cursor: onClick ? 'pointer' : 'default',
        boxSizing: 'border-box'
      }}
      {...animateProps}
      {...props}
    >
      {children}
    </Component>
  )
}
