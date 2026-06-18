import { useState, useEffect, useMemo } from "react";
import { X, Send, Users, MapPin, Building2, ChevronDown, ChevronUp, Search, CheckCircle, Radio } from "lucide-react";
import { get, post } from "../../services/api";

export default function BroadcastSendModal({ onClose }) {
  const [title,           setTitle]           = useState("");
  const [description,     setDescription]     = useState("");
  const [sendToAll,       setSendToAll]       = useState(false);
  const [targetDepts,     setTargetDepts]     = useState([]);
  const [targetLocations, setTargetLocations] = useState([]);
  const [targetEmpIds,    setTargetEmpIds]    = useState([]);

  const [allUsers,        setAllUsers]        = useState([]);
  const [locations,       setLocations]       = useState([]);
  const [departments,     setDepartments]     = useState([]);
  const [loadingUsers,    setLoadingUsers]    = useState(true);

  const [openSection,     setOpenSection]     = useState(null); // "depts" | "locations" | "users"
  const [userSearch,      setUserSearch]      = useState("");
  const [deptSearch,      setDeptSearch]      = useState("");

  const [sending,         setSending]         = useState(false);
  const [result,          setResult]          = useState(null);

  useEffect(() => {
    setLoadingUsers(true);
    Promise.all([
      get("/requests/broadcast-users"),
      get("/requests/locations"),
      get("/requests/departments"),
    ]).then(([users, locData, deptData]) => {
      setAllUsers(Array.isArray(users) ? users : []);
      setLocations(locData.locations || []);
      setDepartments(deptData.departments || []);
    }).catch(() => {}).finally(() => setLoadingUsers(false));
  }, []);

  const toggleAll = () => {
    setSendToAll(v => {
      if (!v) { setTargetDepts([]); setTargetLocations([]); setTargetEmpIds([]); }
      return !v;
    });
  };

  const toggleDept = (d) => {
    setSendToAll(false);
    setTargetDepts(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const toggleLocation = (l) => {
    setSendToAll(false);
    setTargetLocations(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
  };

  const toggleUser = (empId) => {
    setSendToAll(false);
    setTargetEmpIds(prev => prev.includes(empId) ? prev.filter(x => x !== empId) : [...prev, empId]);
  };

  const selectionSummary = useMemo(() => {
    if (sendToAll) return "All Users";
    const parts = [];
    if (targetDepts.length)     parts.push(`${targetDepts.length} dept${targetDepts.length > 1 ? "s" : ""}`);
    if (targetLocations.length) parts.push(`${targetLocations.length} location${targetLocations.length > 1 ? "s" : ""}`);
    if (targetEmpIds.length)    parts.push(`${targetEmpIds.length} user${targetEmpIds.length > 1 ? "s" : ""}`);
    return parts.length ? parts.join(" + ") : "None selected";
  }, [sendToAll, targetDepts, targetLocations, targetEmpIds]);

  const canSend = title.trim() && (sendToAll || targetDepts.length || targetLocations.length || targetEmpIds.length);

  const handleSend = async () => {
    if (!canSend || sending) return;
    setSending(true);
    setResult(null);
    try {
      const resp = await post("/requests/broadcast-send", {
        title:           title.trim(),
        description:     description.trim() || undefined,
        sendToAll,
        targetDepts:     targetDepts.length     ? targetDepts     : undefined,
        targetLocations: targetLocations.length ? targetLocations : undefined,
        targetEmpIds:    targetEmpIds.length    ? targetEmpIds    : undefined,
      });
      setResult({ success: true, sentTo: resp.sentTo });
    } catch (err) {
      setResult({ error: err?.response?.data?.error || "Failed to send." });
    } finally {
      setSending(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase();
    return q ? allUsers.filter(u => u.name.toLowerCase().includes(q) || u.empId.toLowerCase().includes(q) || (u.dept || "").toLowerCase().includes(q)) : allUsers;
  }, [allUsers, userSearch]);

  const filteredDepts = useMemo(() => {
    const q = deptSearch.toLowerCase();
    return q ? departments.filter(d => d.toLowerCase().includes(q)) : departments;
  }, [departments, deptSearch]);

  const SectionHeader = ({ id, icon: Icon, label, count, selectedCount }) => (
    <button
      onClick={() => setOpenSection(prev => prev === id ? null : id)}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
    >
      <div className="flex items-center gap-2">
        <Icon size={13} className="text-indigo-500" />
        <span className="text-[12px] font-black text-slate-700">{label}</span>
        {selectedCount > 0 && (
          <span className="bg-indigo-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{selectedCount}</span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-slate-400">{count} available</span>
        {openSection === id ? <ChevronUp size={13} className="text-slate-400"/> : <ChevronDown size={13} className="text-slate-400"/>}
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col max-h-[92dvh]">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Radio size={18} className="text-white" />
            <h2 className="text-[14px] font-black text-white uppercase tracking-tight">Send Ticket to All</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ticket Title <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Annual Medical Check-up Notice"
              maxLength={100}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[13px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400 transition-all placeholder:text-slate-300"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description (optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add more details about this broadcast ticket..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[12px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400 resize-none transition-all placeholder:text-slate-300"
            />
          </div>

          {/* Target selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Send To</label>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${sendToAll ? "bg-indigo-100 text-indigo-700" : (targetDepts.length || targetLocations.length || targetEmpIds.length) ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-500"}`}>
                {selectionSummary}
              </span>
            </div>

            {/* All Users */}
            <button
              onClick={toggleAll}
              className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-[12px] font-black transition-all ${
                sendToAll ? "bg-indigo-50 border-indigo-400 text-indigo-700" : "bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-200"
              }`}
            >
              <Users size={14} />
              All Users (Everyone)
              {sendToAll && <CheckCircle size={13} className="ml-auto text-indigo-500" />}
            </button>

            {/* Departments section */}
            <SectionHeader id="depts" icon={Building2} label="Departments" count={departments.length} selectedCount={targetDepts.length} />
            {openSection === "depts" && (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-2 border-b border-slate-100">
                  <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                    <input value={deptSearch} onChange={e => setDeptSearch(e.target.value)} placeholder="Search departments..." className="w-full pl-7 pr-2 py-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-300"/>
                  </div>
                </div>
                <div className="overflow-y-auto max-h-40">
                  {filteredDepts.map(d => (
                    <button key={d} onClick={() => toggleDept(d)} className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-all hover:bg-slate-50 ${targetDepts.includes(d) ? "bg-indigo-50" : ""}`}>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${targetDepts.includes(d) ? "bg-indigo-500 border-indigo-500" : "border-slate-300"}`}>
                        {targetDepts.includes(d) && <CheckCircle size={10} className="text-white"/>}
                      </div>
                      <span className="text-[12px] font-medium text-slate-700 truncate">{d}</span>
                    </button>
                  ))}
                </div>
                {targetDepts.length > 0 && (
                  <div className="px-3 py-1.5 border-t border-slate-100 bg-indigo-50 flex items-center justify-between">
                    <span className="text-[10px] font-black text-indigo-600">{targetDepts.length} selected</span>
                    <button onClick={() => setTargetDepts([])} className="text-[10px] text-indigo-400 hover:text-indigo-700 font-bold">Clear</button>
                  </div>
                )}
              </div>
            )}

            {/* Locations section */}
            <SectionHeader id="locations" icon={MapPin} label="Locations / States" count={locations.length} selectedCount={targetLocations.length} />
            {openSection === "locations" && (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-y-auto max-h-40">
                  {locations.map(l => (
                    <button key={l} onClick={() => toggleLocation(l)} className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-all hover:bg-slate-50 ${targetLocations.includes(l) ? "bg-indigo-50" : ""}`}>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${targetLocations.includes(l) ? "bg-indigo-500 border-indigo-500" : "border-slate-300"}`}>
                        {targetLocations.includes(l) && <CheckCircle size={10} className="text-white"/>}
                      </div>
                      <span className="text-[12px] font-medium text-slate-700">{l}</span>
                    </button>
                  ))}
                </div>
                {targetLocations.length > 0 && (
                  <div className="px-3 py-1.5 border-t border-slate-100 bg-indigo-50 flex items-center justify-between">
                    <span className="text-[10px] font-black text-indigo-600">{targetLocations.length} selected</span>
                    <button onClick={() => setTargetLocations([])} className="text-[10px] text-indigo-400 hover:text-indigo-700 font-bold">Clear</button>
                  </div>
                )}
              </div>
            )}

            {/* Users section */}
            <SectionHeader id="users" icon={Users} label="Individual Users" count={allUsers.length} selectedCount={targetEmpIds.length} />
            {openSection === "users" && (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-2 border-b border-slate-100">
                  <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                    <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search by name, ID, or dept..." className="w-full pl-7 pr-2 py-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-300"/>
                  </div>
                </div>
                <div className="overflow-y-auto max-h-48">
                  {loadingUsers ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"/>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <p className="text-center py-6 text-[11px] text-slate-400">No users found</p>
                  ) : filteredUsers.map(u => (
                    <button key={u.empId} onClick={() => toggleUser(u.empId)} className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-all hover:bg-slate-50 ${targetEmpIds.includes(u.empId) ? "bg-indigo-50" : ""}`}>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${targetEmpIds.includes(u.empId) ? "bg-indigo-500 border-indigo-500" : "border-slate-300"}`}>
                        {targetEmpIds.includes(u.empId) && <CheckCircle size={10} className="text-white"/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-800 truncate">{u.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{u.dept}{u.location ? ` · ${u.location}` : ""}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 flex-shrink-0">{u.empId}</span>
                    </button>
                  ))}
                </div>
                {targetEmpIds.length > 0 && (
                  <div className="px-3 py-1.5 border-t border-slate-100 bg-indigo-50 flex items-center justify-between">
                    <span className="text-[10px] font-black text-indigo-600">{targetEmpIds.length} selected</span>
                    <button onClick={() => setTargetEmpIds([])} className="text-[10px] text-indigo-400 hover:text-indigo-700 font-bold">Clear</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Result */}
          {result && (
            <div className={`rounded-xl px-4 py-3 text-[12px] font-bold ${result.success ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {result.success
                ? `✅ Ticket sent to ${result.sentTo} user${result.sentTo !== 1 ? "s" : ""} and automatically closed.`
                : `❌ ${result.error}`}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex gap-2 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-[12px] transition-all active:scale-95">
            {result?.success ? "Done" : "Cancel"}
          </button>
          {!result?.success && (
            <button
              onClick={handleSend}
              disabled={!canSend || sending}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-black text-[12px] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {sending
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Send size={14} />}
              {sending ? "Sending..." : `Send Ticket`}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
