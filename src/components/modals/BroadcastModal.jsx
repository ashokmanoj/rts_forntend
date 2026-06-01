import { useState } from "react";
import { X, Megaphone, Send, Users } from "lucide-react";
import { post } from "../../services/api";
import SearchableSelect from "../ui/SearchableSelect";

const DEPARTMENTS = [
  "Academics-Assam","Academics-Karnataka","Academics-Tripura","Academics-Uttarakhand",
  "Accounts-A","Accounts-G","Animation",
  "Broadcasting-Assam","Broadcasting-Karnataka","Broadcasting-Tripura","Broadcasting-Uttarakhand",
  "Business Development","Corporate Communications","Documentation",
  "Facilities","Food Committee","Game Development","Govt. Relations","HR","Management","Marketing",
  "Operations-Assam","Operations-Bihar","Operations-Karnataka","Operations-Maharashtra",
  "Operations-Mizoram","Operations-Nagaland","Operations-Tripura","Operations-Uttarakhand",
  "Purchase","RTS Help Desk","Software",
  "Stores-Assam","Stores-Karnataka","Stores-Mizoram","Stores-Tripura",
  "System Admin-Assam","System Admin-Karnataka","System Admin-Uttarakhand",
  "TA Committee","Technical Support",
];

export default function BroadcastModal({ onClose }) {
  const [title,       setTitle]       = useState("");
  const [message,     setMessage]     = useState("");
  const [targetDepts, setTargetDepts] = useState([]); // [] = All Users
  const [loading,     setLoading]     = useState(false);
  const [result,      setResult]      = useState(null);

  const isAll = targetDepts.length === 0;

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const resp = await post("/push/broadcast", {
        title:       title.trim(),
        message:     message.trim(),
        targetDepts: targetDepts, // [] = all users
      });
      setResult({ success: true, sentTo: resp.sentTo, targetDepts: resp.targetDepts });
    } catch (err) {
      setResult({ error: err?.response?.data?.error || "Failed to send broadcast." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Megaphone size={18} className="text-white" />
            <h2 className="text-[14px] font-black text-white uppercase tracking-tight">Send Broadcast</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* Target Departments multi-select */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Send To
              </label>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                isAll ? "bg-violet-100 text-violet-700" : "bg-indigo-100 text-indigo-700"
              }`}>
                {isAll
                  ? "All Users"
                  : `${targetDepts.length} dept${targetDepts.length > 1 ? "s" : ""} selected`}
              </span>
            </div>

            {/* All Users toggle */}
            <button
              onClick={() => setTargetDepts([])}
              className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[12px] font-black transition-all ${
                isAll
                  ? "bg-violet-50 border-violet-300 text-violet-700"
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:border-violet-200"
              }`}
            >
              <Users size={14} />
              All Users (Universal Broadcast)
              {isAll && <span className="ml-auto text-violet-500 text-[10px]">✓ Selected</span>}
            </button>

            {/* Dept multi-select */}
            <SearchableSelect
              multiSelect
              value={targetDepts}
              onChange={setTargetDepts}
              options={DEPARTMENTS.map(d => ({ value: d, label: d }))}
              placeholder="Or select specific departments..."
              triggerClassName="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold hover:border-violet-300"
            />
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Notification Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Important Announcement"
              maxLength={80}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[13px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-violet-400 transition-all placeholder:text-slate-300"
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Message
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type your broadcast message here..."
              rows={4}
              maxLength={300}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[13px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-violet-400 resize-none transition-all placeholder:text-slate-300"
            />
            <p className="text-[10px] text-slate-400 text-right">{message.length}/300</p>
          </div>

          {/* Result */}
          {result && (
            <div className={`rounded-xl px-4 py-3 text-[12px] font-bold ${
              result.success
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {result.success
                ? `✅ Sent to ${result.sentTo} user${result.sentTo !== 1 ? "s" : ""} ${
                    result.targetDepts === "all"
                      ? "(all departments)"
                      : `in ${Array.isArray(result.targetDepts) ? result.targetDepts.join(", ") : result.targetDepts}`
                  }`
                : `❌ ${result.error}`}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-[12px] transition-all active:scale-95"
            >
              Close
            </button>
            <button
              onClick={handleSend}
              disabled={loading || !title.trim() || !message.trim()}
              className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl font-black text-[12px] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Send size={14} />}
              {loading ? "Sending..." : "Send Notification"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
