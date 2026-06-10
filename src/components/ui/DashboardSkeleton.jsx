/**
 * Full-page skeleton shown on first load.
 * Uses the same synchronized per-bone shimmer as TableSkeleton so the wave
 * sweeps consistently across every element regardless of size.
 */
function Bone({ className = "", style = {} }) {
  return <div className={`sk-bone rounded ${className}`} style={style} />;
}

export default function DashboardSkeleton() {
  return (
    <div className="h-dvh bg-[#f8fafc] font-sans flex flex-col overflow-hidden">
      <style>{`
        .sk-bone {
          background: linear-gradient(90deg, #c8d3e0 25%, #e8edf4 50%, #c8d3e0 75%);
          background-size: 400% 100%;
          animation: sk-wave 1.5s ease-in-out infinite;
        }
        @keyframes sk-wave {
          0%   { background-position: 100% 50%; }
          100% { background-position:   0% 50%; }
        }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-3 sm:px-6 pt-3 sm:pt-5">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Bone className="w-9 h-9 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
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

      {/* ── Tab bar ────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-3 sm:px-6 pt-2 pb-1 flex items-center gap-2">
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          {[80, 60, 72, 68].map((w, i) => (
            <Bone key={i} className="h-8 rounded-lg" style={{ width: w }} />
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <Bone className="h-8 w-28 rounded-xl" />
          <Bone className="h-8 w-8 rounded-xl" />
          <Bone className="h-8 w-8 rounded-xl" />
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden px-3 sm:px-6 pb-4">
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 h-full overflow-auto">
          <table className="w-full border-separate min-w-[860px]" style={{ borderSpacing: 0 }}>
            <thead>

              {/* Group header */}
              <tr>
                <th colSpan="11" className="sticky top-0 bg-blue-200/80 border border-slate-300 p-3 text-center z-20">
                  <Bone className="h-3 w-44 mx-auto" />
                </th>
                <th className="sticky top-0 bg-slate-100 w-8 z-20" />
                <th colSpan="6" className="sticky top-0 bg-orange-200/80 border border-slate-300 p-3 text-center z-20">
                  <Bone className="h-3 w-36 mx-auto" />
                </th>
                <th className="sticky top-0 bg-sky-100 border-t border-b border-r border-slate-300 p-3 text-center z-20">
                  <Bone className="h-3 w-16 mx-auto" />
                </th>
              </tr>

              {/* Column headers */}
              <tr className="bg-slate-50">
                {[40, 56, 52, 60, 64, 72, 60, 60, 62, 60, 64].map((w, i) => (
                  <th key={i} className={`sticky top-[45px] bg-slate-50 border-t border-b border-r border-slate-300 ${i === 0 ? "border-l" : ""} p-2 z-10`}>
                    <Bone className="h-2.5 mx-auto" style={{ width: w }} />
                  </th>
                ))}
                <th className="sticky top-[45px] bg-slate-100 w-8 z-10 border-b border-slate-200" />
                {[44, 60, 52, 52, 68, 56].map((w, i) => (
                  <th key={i} className={`sticky top-[45px] bg-slate-50 border-t border-b border-r border-slate-300 ${i === 0 ? "border-l" : ""} p-1 z-10`}>
                    <Bone className="h-2.5 mx-auto" style={{ width: w }} />
                  </th>
                ))}
                <th className="sticky top-[45px] bg-slate-50 border-t border-b border-r border-slate-300 p-2 z-10">
                  <Bone className="h-2.5 w-24 mx-auto" />
                </th>
              </tr>
            </thead>

            <tbody className="bg-white">
              {Array.from({ length: 12 }).map((_, row) => (
                <tr key={row}>
                  <td className="border-b border-l border-r border-slate-200 p-2">
                    <Bone className="h-2.5 w-5 mx-auto" />
                  </td>
                  <td className="border-b border-r border-slate-200 p-2">
                    <Bone className="h-2.5 w-16 mx-auto" />
                  </td>
                  <td className="border-b border-r border-slate-200 p-2">
                    <Bone className="h-2.5 w-12 mx-auto" />
                  </td>
                  <td className="border-b border-r border-slate-200 p-2">
                    <Bone className="h-2.5 w-20 mx-auto" />
                  </td>
                  <td className="border-b border-r border-slate-200 p-2">
                    <Bone className="h-4 w-16 mx-auto rounded-full" />
                  </td>
                  <td className="border-b border-r border-slate-200 p-2">
                    <Bone className="h-2.5 w-24 mx-auto" />
                  </td>
                  <td className="border-b border-r border-slate-200 p-2">
                    <Bone className="h-2.5 w-14 mx-auto" />
                  </td>
                  <td className="border-b border-r border-slate-200 p-2">
                    <Bone className="h-5 w-16 mx-auto rounded-full" />
                  </td>
                  <td className="border-b border-r border-slate-200 p-2">
                    <Bone className="h-5 w-16 mx-auto rounded-full" />
                  </td>
                  <td className="border-b border-r border-slate-200 p-1">
                    <Bone className="h-4 w-12 mx-auto rounded-lg" />
                  </td>
                  <td className="border-b border-r border-slate-200 p-1">
                    <div className="space-y-1">
                      <Bone className="h-2.5 w-14 mx-auto" />
                      <Bone className="h-2 w-10 mx-auto" />
                    </div>
                  </td>
                  <td className="bg-slate-50 border-b border-slate-200 w-8" />
                  <td className="border-l border-b border-r border-slate-200 p-2">
                    <Bone className="h-2.5 w-16 mx-auto" />
                  </td>
                  <td className="border-b border-r border-slate-200 p-2">
                    <Bone className="h-2.5 w-20 mx-auto" />
                  </td>
                  <td className="border-b border-r border-slate-200 p-2">
                    <Bone className="h-5 w-14 mx-auto rounded-full" />
                  </td>
                  <td className="border-b border-r border-slate-200 p-2">
                    <Bone className="h-5 w-14 mx-auto rounded-full" />
                  </td>
                  <td className="border-b border-r border-slate-200 p-2">
                    <Bone className="h-5 w-16 mx-auto rounded-full" />
                  </td>
                  <td className="border-b border-r border-slate-200 p-1">
                    <Bone className="h-5 w-14 mx-auto rounded-lg" />
                  </td>
                  <td className="border-b border-r border-slate-200 p-1">
                    <Bone className="h-5 w-16 mx-auto rounded-lg" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
