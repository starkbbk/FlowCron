export default function LoadingSkeleton({ className = '', width, height = '20px', rounded = '6px' }) {
  return (
    <div
      className={`bg-[#18181b] animate-pulse ${className}`}
      style={{
        width: width || '100%',
        height,
        borderRadius: rounded,
      }}
    />
  )
}

export function CardSkeleton() {
  return (
    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '28px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <LoadingSkeleton height="24px" width="60%" />
      <LoadingSkeleton height="16px" width="80%" />
      <LoadingSkeleton height="16px" width="40%" />
      <div className="flex gap-2 mt-4">
        <LoadingSkeleton height="32px" width="80px" rounded="8px" />
        <LoadingSkeleton height="32px" width="80px" rounded="8px" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            padding: '16px 20px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255,255,255,0.02)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            minHeight: '56px',
          }}
        >
          <LoadingSkeleton width="52px" height="20px" rounded="6px" />
          <LoadingSkeleton width="28%" height="14px" rounded="4px" />
          <LoadingSkeleton width="18%" height="14px" rounded="4px" />
          <LoadingSkeleton width="10%" height="14px" rounded="4px" />
          <LoadingSkeleton width="12%" height="14px" rounded="4px" />
          <div style={{ marginLeft: 'auto' }}>
            <LoadingSkeleton width="28px" height="28px" rounded="8px" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Full dashboard-shaped loading placeholder */
export function StatSkeleton() {
  return (
    <div className="space-y-6 pb-16 animate-pulse">
      {/* Hero Skeleton */}
      <div className="bg-[#111113]/40 border border-[#27272a] p-8 space-y-4 rounded-2xl shadow-sm min-h-[200px] mt-6">
        <LoadingSkeleton height="20px" width="120px" rounded="999px" />
        <LoadingSkeleton height="40px" width="45%" rounded="8px" />
        <LoadingSkeleton height="20px" width="60%" rounded="6px" />
      </div>

      {/* Stats Grid: 12 columns */}
      <div className="grid grid-cols-12 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-3 bg-[#111113]/40 border border-[#27272a] p-6 flex flex-col justify-between h-[180px] rounded-2xl shadow-sm">
            <LoadingSkeleton height="16px" width="50%" rounded="4px" />
            <div className="mt-auto space-y-2">
              <LoadingSkeleton height="36px" width="40%" rounded="6px" />
              <LoadingSkeleton height="10px" width="30%" rounded="4px" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: 12 columns */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
          <div className="bg-[#111113]/40 border border-[#27272a] p-6 space-y-4 rounded-2xl shadow-sm">
            <LoadingSkeleton height="24px" width="30%" rounded="4px" />
            <LoadingSkeleton height="340px" width="100%" rounded="8px" />
          </div>
          <div className="bg-[#111113]/40 border border-[#27272a] p-6 space-y-4 rounded-2xl shadow-sm">
            <LoadingSkeleton height="24px" width="20%" rounded="4px" />
            <LoadingSkeleton height="120px" width="100%" rounded="8px" />
          </div>
        </div>
        <div className="col-span-12 xl:col-span-4">
          <div className="bg-[#111113]/40 border border-[#27272a] p-6 space-y-4 rounded-2xl shadow-sm min-h-[550px]">
            <LoadingSkeleton height="24px" width="45%" rounded="4px" />
            <div className="space-y-6 mt-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <LoadingSkeleton height="10px" width="10px" rounded="999px" className="shrink-0" />
                  <div className="flex-1 space-y-2">
                    <LoadingSkeleton height="14px" width="70%" />
                    <LoadingSkeleton height="10px" width="40%" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
