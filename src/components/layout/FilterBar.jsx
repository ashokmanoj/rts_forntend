import { Search, Plus, ChevronDown, LogOut, BookOpen } from "lucide-react";
import { useState } from "react";

/**
 * Top bar: filter dropdowns + date + search + Add Request + user avatar.
 *
 * Props:
 *   currentUser        — { name, role }
 *   requestCount       — number
 *   onAddRequest       — () => void
 *   onShowInstructions — () => void
 *   onLogout           — () => void
 */
export default function FilterBar({
  currentUser,
  requestCount,
  onAddRequest,
  onShowInstructions,
  onLogout,
}) {
  const [showProfile, setShowProfile] = useState(false);

  const initials = currentUser.name.slice(0, 2).toUpperCase();

  return (
    <div className="mb-6 space-y-3">
      {/* ── Main bar ── */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        {/* Filter dropdowns + date + search button */}
        <div className="flex-1 flex gap-3 overflow-x-auto">
          {[
            "Requestor Name",
            "Assigned Name",
            "Requested Department",
            "Assigned Department",
            "-- All Status --",
          ].map((label) => (
            <div key={label} className="relative min-w-[140px]">
              <select className="w-full appearance-none bg-white border border-slate-200 py-2 px-4 pr-8 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                <option>{label}</option>
              </select>
              <ChevronDown
                className="absolute right-2 top-2.5 text-slate-400 pointer-events-none"
                size={14}
              />
            </div>
          ))}

          {/* Date picker */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-2 gap-4 min-w-[200px]">
            <input
              type="date"
              className="w-full text-sm text-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Text search input */}
        <div className="relative">
          <input
            type="search"
            className="w-full px-4 py-2 border border-slate-300 focus:outline-none rounded-lg"
            placeholder="Search..."
          />
          <Search
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
        </div>

        {/* Add Request button */}
        <button
          onClick={onAddRequest}
          className="bg-green-500 border border-slate-300 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-sm transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus size={16} className="mr-1" /> Add Request
        </button>

        {/* User avatar + profile dropdown */}
        <div className="flex items-center gap-3 ml-2 border-l pl-4 border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-[12px] font-black text-slate-800 leading-none">
              {currentUser.name}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              {currentUser.role}
            </p>
          </div>
          <button
            onClick={() => setShowProfile((v) => !v)}
            className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center border-2 border-white shadow-sm hover:bg-indigo-200 transition-colors relative"
          >
            <span className="font-bold text-sm">{initials}</span>

            {showProfile && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowProfile(false)}
                />
                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden">
                  <div className="p-3 border-b border-slate-50 bg-slate-50/50 sm:hidden">
                    <p className="font-bold text-slate-800">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {currentUser.role}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setShowProfile(false);
                    }}
                    className="w-full flex items-center gap-1 px-4 py-3 text-red-500 hover:bg-red-50 transition-colors font-bold text-[12px]"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Sub-bar: count + instructions ── */}
      <div className="flex items-center justify-between px-1">
        <p className="text-[16px] text-green-500">{requestCount} requests.</p>
        <button
          onClick={onShowInstructions}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-black text-[12px] shadow-md transition-all active:scale-95"
        >
          <BookOpen size={15} /> Instructions
        </button>
      </div>
    </div>
  );
}
