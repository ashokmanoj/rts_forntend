import { CheckCircle, XCircle, Clock, Forward } from "lucide-react";

/**
 * Renders a coloured pill for RM / HOD status values.
 * status: "--" | "Approved" | "Rejected" | "Checking" | "Forwarded" | "Pending"
 */
export default function StatusBadge({ status, date }) {
  if (!status || status === "--") {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold text-slate-400">
          --
        </span>
      </div>
    );
  }
  if (status === "Approved") {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold text-green-500">
          <CheckCircle size={9} /> Approved
        </span>
        {date && <span className="text-[9px] text-slate-700">{date}</span>}
      </div>
    );
  }
  if (status === "Rejected") {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold text-red-500">
          <XCircle size={9} /> Rejected
        </span>
        {date && <span className="text-[9px] text-slate-700">{date}</span>}
      </div>
    );
  }
  if (status === "Checking" || status === "Pending") {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold text-amber-500">
          <Clock size={9} /> Checking...
        </span>
        {date && <span className="text-[9px] text-slate-700">{date}</span>}
      </div>
    );
  }
  if (status === "Forwarded") {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold text-blue-500">
          <Forward size={9} /> Forwarded
        </span>
        {date && <span className="text-[9px] text-slate-700">{date}</span>}
      </div>
    );
  }
  return null;
}
