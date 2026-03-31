/**
 * System message — shown for ticket closure events and other system events.
 */
export default function SystemMessage({ log }) {
  return (
    <div className="flex items-center justify-center my-2">
      <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-2 text-center max-w-[90%]">
        <p className="text-[11px] font-black text-red-600">{log.text}</p>
        <p className="text-[9px] text-slate-400 mt-0.5">{log.date} · {log.time}</p>
      </div>
    </div>
  );
}