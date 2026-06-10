/**
 * Synchronized shimmer: all bones use the same gradient + animation so they
 * all lighten together as one wave — the 400% background-size makes the phase
 * position consistent across every element width, giving the YouTube effect
 * without needing a positioned overlay (which breaks inside overflow:auto).
 */
function Bone({ className = "", style = {} }) {
  return <div className={`sk-bone rounded ${className}`} style={style} />;
}

export default function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-200 h-full overflow-auto">
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

      <table className="w-full border-separate min-w-[860px]" style={{ borderSpacing: 0 }}>
        <thead>

          {/* ── Group header ────────────────────────────────────────────────── */}
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

          {/* ── Column headers ──────────────────────────────────────────────── */}
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
          {Array.from({ length: 20 }).map((_, row) => (
            <tr key={row}>

              {/* Sl.No */}
              <td className="border-b border-l border-r border-slate-200 p-2 text-center">
                <Bone className="h-2.5 w-5 mx-auto" />
              </td>
              {/* Date */}
              <td className="border-b border-r border-slate-200 p-2">
                <Bone className="h-2.5 w-16 mx-auto" />
              </td>
              {/* User ID */}
              <td className="border-b border-r border-slate-200 p-2">
                <Bone className="h-2.5 w-12 mx-auto" />
              </td>
              {/* Name */}
              <td className="border-b border-r border-slate-200 p-2">
                <Bone className="h-2.5 w-20 mx-auto" />
              </td>
              {/* Dept */}
              <td className="border-b border-r border-slate-200 p-2">
                <Bone className="h-4 w-16 mx-auto rounded-full" />
              </td>
              {/* Designation */}
              <td className="border-b border-r border-slate-200 p-2">
                <Bone className="h-2.5 w-24 mx-auto" />
              </td>
              {/* Location */}
              <td className="border-b border-r border-slate-200 p-2">
                <Bone className="h-2.5 w-14 mx-auto" />
              </td>
              {/* RM Status */}
              <td className="border-b border-r border-slate-200 p-2">
                <Bone className="h-5 w-16 mx-auto rounded-full" />
              </td>
              {/* HOD Status */}
              <td className="border-b border-r border-slate-200 p-2">
                <Bone className="h-5 w-16 mx-auto rounded-full" />
              </td>
              {/* Urgency Level */}
              <td className="border-b border-r border-slate-200 p-1">
                <Bone className="h-4 w-12 mx-auto rounded-lg" />
              </td>
              {/* Due / Days Left */}
              <td className="border-b border-r border-slate-200 p-1">
                <div className="space-y-1">
                  <Bone className="h-2.5 w-14 mx-auto" />
                  <Bone className="h-2 w-10 mx-auto" />
                </div>
              </td>

              {/* Separator column */}
              <td className="bg-slate-50 border-b border-slate-200 w-8" />

              {/* Details */}
              <td className="border-l border-b border-r border-slate-200 p-2">
                <Bone className="h-2.5 w-16 mx-auto" />
              </td>
              {/* Department */}
              <td className="border-b border-r border-slate-200 p-2">
                <Bone className="h-2.5 w-20 mx-auto" />
              </td>
              {/* Assign RM */}
              <td className="border-b border-r border-slate-200 p-2">
                <Bone className="h-5 w-14 mx-auto rounded-full" />
              </td>
              {/* Assign HOD */}
              <td className="border-b border-r border-slate-200 p-2">
                <Bone className="h-5 w-14 mx-auto rounded-full" />
              </td>
              {/* Dept HOD Status */}
              <td className="border-b border-r border-slate-200 p-2">
                <Bone className="h-5 w-16 mx-auto rounded-full" />
              </td>
              {/* Request Status */}
              <td className="border-b border-r border-slate-200 p-1">
                <Bone className="h-5 w-14 mx-auto rounded-lg" />
              </td>

              {/* Acknowledgement */}
              <td className="border-b border-r border-slate-200 p-1">
                <Bone className="h-5 w-16 mx-auto rounded-lg" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
