function Bone({ className = "" }) {
  return <div className={`bg-slate-200 animate-pulse rounded-lg ${className}`} />;
}

export default function DashboardSkeleton() {
  return (
    <div className="h-dvh bg-[#f8fafc] font-sans flex flex-col overflow-hidden">

      {/* Header skeleton */}
      <div className="flex-shrink-0 px-3 sm:px-6 pt-3 sm:pt-5">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Bone className="w-9 h-9 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5 min-w-0">
              <Bone className="h-3 w-28" />
              <Bone className="h-2.5 w-44" />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Bone className="h-8 w-24 rounded-xl" />
            <Bone className="h-8 w-20 rounded-xl" />
            <Bone className="h-8 w-8 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Tab bar skeleton */}
      <div className="flex-shrink-0 px-3 sm:px-6 pt-2 pb-1 flex items-center gap-2">
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          {[80, 60, 72].map((w, i) => (
            <Bone key={i} className="h-8 rounded-lg" style={{ width: `${w}px` }} />
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <Bone className="h-8 w-8 rounded-xl" />
          <Bone className="h-8 w-8 rounded-xl" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="flex-1 overflow-hidden px-3 sm:px-6 pb-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full overflow-hidden flex flex-col">

          {/* Table header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/60">
            {[60, 80, 100, 80, 70, 70, 90, 60].map((w, i) => (
              <Bone key={i} className="h-2.5 flex-shrink-0" style={{ width: `${w}px` }} />
            ))}
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-hidden divide-y divide-slate-50">
            {Array.from({ length: 8 }).map((_, row) => (
              <div
                key={row}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ animationDelay: `${row * 60}ms` }}
              >
                {/* Badge */}
                <Bone className="h-5 w-14 rounded-full flex-shrink-0" />
                {/* Name + dept */}
                <div className="space-y-1.5 w-28 flex-shrink-0">
                  <Bone className="h-2.5 w-full" />
                  <Bone className="h-2 w-3/4" />
                </div>
                {/* Dept chip */}
                <Bone className="h-5 w-20 rounded-full flex-shrink-0" />
                {/* Status dots */}
                <Bone className="h-6 w-16 rounded-full flex-shrink-0" />
                <Bone className="h-6 w-16 rounded-full flex-shrink-0" />
                <Bone className="h-6 w-16 rounded-full flex-shrink-0" />
                {/* Date */}
                <Bone className="h-2.5 w-20 flex-shrink-0" />
                {/* Priority chip */}
                <Bone className="h-5 w-12 rounded-full flex-shrink-0" />
                {/* Action button */}
                <Bone className="h-7 w-16 rounded-lg flex-shrink-0 ml-auto" />
              </div>
            ))}
          </div>

          {/* Pagination skeleton */}
          <div className="flex-shrink-0 border-t border-slate-100 px-4 py-2.5 flex items-center justify-between">
            <Bone className="h-3 w-24" />
            <div className="flex gap-1">
              {[1, 2, 3].map(i => <Bone key={i} className="h-7 w-7 rounded-lg" />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
