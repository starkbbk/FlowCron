import { motion } from 'framer-motion'

const variants = {
  default: { 
    backgroundColor: 'rgba(255, 255, 255, 0.035)', 
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(30px) saturate(140%)',
    WebkitBackdropFilter: 'blur(30px) saturate(140%)',
    boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)'
  },
  strong: { 
    backgroundColor: 'rgba(255, 255, 255, 0.055)', 
    border: '1px solid rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(40px) saturate(160%)',
    WebkitBackdropFilter: 'blur(40px) saturate(160%)',
    boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.6), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)'
  },
  subtle: { 
    backgroundColor: 'rgba(255, 255, 255, 0.02)', 
    border: '1px solid rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)'
  },
}

const paddingPresets = {
  none: 'p-0',
  compact: 'p-[20px]',    // Small cards: padding 20px
  standard: 'p-[24px]',   // Medium cards: padding 24px
  large: 'p-[28px]',      // Large cards: padding 28px
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
          borderColor: 'rgba(255, 255, 255, 0.18)',
          backgroundColor: variant === 'strong' ? 'rgba(255, 255, 255, 0.085)' : 'rgba(255, 255, 255, 0.055)',
          y: -4,
          transition: { duration: 0.2, ease: 'easeOut' } 
        } : undefined,
      }
    : {}

  // Merge internal styles with incoming props.style to prevent overriding
  const combinedStyle = {
    ...variants[variant],
    borderRadius: '24px',
    position: 'relative', 
    cursor: onClick ? 'pointer' : 'default',
    boxSizing: 'border-box',
    ...props.style
  }

  return (
    <Component
      className={`${paddingPresets[padding]} ${className}`}
      onClick={onClick}
      {...animateProps}
      {...props}
      style={combinedStyle}
    >
      {children}
    </Component>
  )
}
