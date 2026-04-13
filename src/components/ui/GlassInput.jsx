import { forwardRef } from 'react'

const baseStyles = {
  backgroundColor: '#111113',
  border: '1px solid #27272a',
  borderRadius: '8px',
  color: '#fafafa',
  fontSize: '14px',
  outline: 'none',
  width: '100%',
  transition: 'border-color 150ms ease',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

export const GlassInput = forwardRef(
  ({ label, error, className = '', startIcon: StartIcon, endAdornment, ...props }, ref) => {
    const padLeft = StartIcon ? 40 : 12
    const padRight = endAdornment ? 44 : 12
    return (
      <div className={`flex flex-col gap-4 ${className}`}>
        {label && (
          <label className="text-[13px] font-bold text-[#a1a1aa] uppercase tracking-widest ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          {StartIcon ? (
            <StartIcon
              aria-hidden
              className="absolute left-4 top-1/2 z-[1] -translate-y-1/2 text-[#71717a] pointer-events-none"
              size={20}
              strokeWidth={2}
            />
          ) : null}
          <input
            ref={ref}
            style={{
              ...baseStyles,
              paddingTop: '24px',
              paddingBottom: '24px',
              paddingLeft: `${padLeft + 32}px`,
              paddingRight: `${padRight + 32}px`,
              borderColor: error ? '#ef4444' : '#3a3a3c',
              fontSize: '16px'
            }}
            className="focus:border-[#007aff] shadow-sm"
            {...props}
          />
          {endAdornment ? (
            <div className="absolute right-2 top-1/2 z-[2] -translate-y-1/2 flex items-center justify-center">
              {endAdornment}
            </div>
          ) : null}
        </div>
        {error && <span className="text-[13px] text-[#ef4444] font-semibold ml-1">{error}</span>}
      </div>
    )
  },
)
GlassInput.displayName = 'GlassInput'

export const GlassTextarea = forwardRef(({ label, error, className = '', ...props }, ref) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    {label && (
      <label className="text-[12px] font-medium text-[#71717a] uppercase tracking-wider ml-0.5">
        {label}
      </label>
    )}
    <textarea
      ref={ref}
      style={{
        ...baseStyles,
        padding: '10px 12px',
        resize: 'vertical',
        minHeight: '100px',
        borderColor: error ? '#ef4444' : '#27272a',
      }}
      className="focus:border-[#3b82f6]"
      {...props}
    />
    {error && <span className="text-[12px] text-[#ef4444] font-medium ml-0.5">{error}</span>}
  </div>
))
GlassTextarea.displayName = 'GlassTextarea'

export const GlassSelect = forwardRef(({ label, error, options = [], className = '', ...props }, ref) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    {label && (
      <label className="text-[12px] font-medium text-[#71717a] uppercase tracking-wider ml-0.5">
        {label}
      </label>
    )}
    <div className="relative">
      <select
        ref={ref}
        style={{
          ...baseStyles,
          backgroundColor: '#111113',
          appearance: 'none',
          padding: '10px 40px 10px 12px',
          cursor: 'pointer',
          borderColor: error ? '#ef4444' : '#27272a',
        }}
        className="focus:border-[#3b82f6]"
        {...props}
      >
        {options.map((opt) => (
          <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value} style={{ background: '#111113', color: '#fafafa' }}>
            {typeof opt === 'string' ? opt : opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#52525b]">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
    {error && <span className="text-[12px] text-[#ef4444] font-medium ml-0.5">{error}</span>}
  </div>
))
GlassSelect.displayName = 'GlassSelect'

export function GlassToggle({ label, checked, onChange, className = '' }) {
  return (
    <label className={`flex items-center gap-4 cursor-pointer group ${className}`}>
      <div
        onClick={() => onChange?.(!checked)}
        className={`w-10 h-5.5 rounded-full p-1 transition-all duration-150 relative ${checked ? 'bg-[#3b82f6]' : 'bg-[#27272a]'}`}
      >
        <div
          className={`w-3.5 h-3.5 rounded-full bg-[#ffffff] transition-transform duration-150 ${checked ? 'translate-x-[18px]' : 'translate-x-0'}`}
        />
      </div>
      {label && <span className="text-[14px] font-medium text-[#a1a1aa] group-hover:text-[#fafafa] transition-colors">{label}</span>}
    </label>
  )
}
