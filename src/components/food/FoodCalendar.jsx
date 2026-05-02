import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TYPE_STYLES = {
  'working':          'bg-green-100 text-green-700 font-black border border-green-200',
  'working-saturday': 'bg-green-100 text-green-700 font-black border border-green-200',
  'cancelled':        'bg-red-100 text-red-600 font-bold border border-red-200',
  'inactive':         'bg-orange-50 text-orange-300 font-medium border border-orange-100',
  'holiday':          'bg-purple-100 text-purple-700 font-bold border border-purple-200',
  'weekend':          'bg-purple-100 text-purple-400 font-medium border border-purple-200',
  'not-subscribed':   'bg-white text-slate-300 font-medium border border-slate-100',
};

export default function FoodCalendar({ calendarData, month, year, onPrev, onNext, loading, canGoPrev = true, canGoNext = true }) {
  const days = calendarData?.days || [];

  // Extract holidays for the side list
  const holidays = days.filter(d => d.type === 'holiday');

  // Build the grid: Monday-first offset
  const firstDay = days[0] ? new Date(days[0].date + 'T00:00:00') : null;
  const offset   = firstDay ? ((firstDay.getDay() + 6) % 7) : 0;

  const cells = [...Array(offset).fill(null), ...days];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthName = firstDay
    ? firstDay.toLocaleString('default', { month: 'long', year: 'numeric' })
    : `${month}/${year}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-all active:scale-95 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="font-black text-slate-800 text-[14px] tracking-tight">{monthName}</h3>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-all active:scale-95 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* ── Body: calendar + holiday list side by side ────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-0">
          {/* ── Calendar grid ─────────────────────────────────────────────── */}
          <div className="flex-1 p-3 sm:p-4">
            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAY_LABELS.map(d => (
                <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((cell, i) => {
                if (!cell) return <div key={i} />;
                const date    = new Date(cell.date + 'T00:00:00');
                const dateNum = date.getDate();
                const today   = new Date();
                const isToday =
                  date.getDate()     === today.getDate() &&
                  date.getMonth()    === today.getMonth() &&
                  date.getFullYear() === today.getFullYear();

                return (
                  <div
                    key={cell.date}
                    title={cell.name || cell.type}
                    className={`
                      relative flex flex-col items-center justify-center rounded-xl h-10
                      text-[12px] transition-all
                      ${TYPE_STYLES[cell.type] || 'bg-white text-slate-400'}
                      ${isToday ? 'ring-2 ring-indigo-400 ring-offset-1' : ''}
                    `}
                  >
                    <span>{dateNum}</span>
                    {cell.name && (
                      <span className="text-[8px] leading-tight text-purple-600 font-bold truncate max-w-[90%]">
                        {cell.name.split(' ')[0]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Holiday list (right side / bottom on mobile) ───────────────── */}
          <div className="w-full sm:w-52 border-t sm:border-t-0 sm:border-l border-slate-100 flex flex-col shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-3 border-b border-slate-100 bg-purple-50">
              <CalendarDays size={13} className="text-purple-600" />
              <span className="text-[11px] font-black text-purple-700 uppercase tracking-tight">Holidays</span>
            </div>
            <div className="flex-1 overflow-y-auto max-h-36 sm:max-h-64">
              {holidays.length === 0 ? (
                <p className="text-[11px] text-slate-400 font-medium text-center py-6 px-3">
                  No holidays this month
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {holidays.map(h => {
                    const d = new Date(h.date + 'T00:00:00');
                    return (
                      <li key={h.date} className="px-3 py-2.5 hover:bg-purple-50/50 transition-colors">
                        <p className="text-[12px] font-bold text-slate-700 leading-tight">{h.name}</p>
                        <p className="text-[10px] text-purple-600 font-medium mt-0.5">
                          {d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Legend ───────────────────────────────────────────────────────── */}
      <div className="px-3 sm:px-5 py-3 border-t border-slate-100 flex flex-wrap gap-2 sm:gap-3">
        {[
          { color: 'bg-green-100 border-green-200',   label: 'Working Day' },
          { color: 'bg-red-100 border-red-200',       label: 'Cancelled' },
          { color: 'bg-orange-50 border-orange-100',  label: 'Food Disabled' },
          { color: 'bg-purple-100 border-purple-200', label: 'Holiday' },
          { color: 'bg-purple-100 border-purple-200',  label: 'Weekend / Off' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm border ${color}`} />
            <span className="text-[10px] text-slate-500 font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Summary ──────────────────────────────────────────────────────── */}
      {calendarData?.subscribed && (
        <div className="px-5 py-3 bg-indigo-50 border-t border-indigo-100 flex items-center justify-between">
          <span className="text-[12px] text-indigo-700 font-bold">
            Working Days: <span className="font-black">{calendarData.workingDays}</span>
          </span>
          <span className="text-[13px] text-indigo-700 font-black">
            ₹{calendarData.totalAmount}
          </span>
        </div>
      )}
    </div>
  );
}
