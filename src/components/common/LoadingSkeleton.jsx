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
    <div className="bg-[#111113] border border-[#27272a] p-6 space-y-4 rounded-xl shadow-sm">
      <LoadingSkeleton height="24px" width="60%" />
      <LoadingSkeleton height="16px" width="80%" />
      <LoadingSkeleton height="16px" width="40%" />
      <div className="flex gap-2 mt-4">
        <LoadingSkeleton height="32px" width="80px" rounded="6px" />
        <LoadingSkeleton height="32px" width="80px" rounded="6px" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-[#111113] border border-[#27272a] p-4 flex items-center gap-4 rounded-lg">
          <LoadingSkeleton width="40px" height="24px" rounded="4px" />
          <LoadingSkeleton width="30%" height="14px" />
          <LoadingSkeleton width="20%" height="14px" />
          <LoadingSkeleton width="15%" height="14px" />
          <div className="ml-auto">
            <LoadingSkeleton width="24px" height="24px" rounded="4px" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Full dashboard-shaped loading placeholder */
export function StatSkeleton() {
  return (
    <div className="space-y-8 pb-16 max-w-[1400px] mx-auto animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between gap-6">
        <div className="space-y-2 flex-1">
          <LoadingSkeleton height="32px" width="40%" rounded="8px" />
          <LoadingSkeleton height="14px" width="60%" rounded="4px" />
        </div>
        <LoadingSkeleton height="40px" width="140px" rounded="8px" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#111113] border border-[#27272a] p-5 space-y-3 rounded-xl shadow-sm">
            <LoadingSkeleton height="16px" width="30%" rounded="4px" />
            <LoadingSkeleton height="32px" width="50%" rounded="6px" />
          </div>
        ))}
      </div>
      <div className="bg-[#111113] border border-[#27272a] p-6 space-y-4 rounded-xl shadow-sm">
        <LoadingSkeleton height="20px" width="20%" rounded="4px" />
        <LoadingSkeleton height="240px" width="100%" rounded="8px" />
      </div>
    </div>
  )
}
