import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { X, Send, Users, MapPin, Building2, ChevronDown, ChevronUp, Search, CheckCircle, Radio, Upload, FileText, FileSpreadsheet, FileImage, Film, Music, Archive, File, ZoomIn } from "lucide-react";
import { get, postForm } from "../../services/api";

const ALLOWED_EXTENSIONS = [".jpg",".jpeg",".png",".gif",".webp",".bmp",".svg",".mp4",".mov",".avi",".mkv",".mp3",".wav",".ogg",".pdf",".doc",".docx",".csv",".xlsx",".xls",".zip",".rar",".7z",".tar",".gz"];
const MAX_FILES       = 10;
const MAX_TOTAL_BYTES = 20 * 1024 * 1024;

function isAllowed(f) {
  const ext = "." + (f.name || "").split(".").pop().toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}
function isImage(f) { return f.type.startsWith("image/"); }
function getIcon(name = "") {
  const n = name.toLowerCase();
  if (/\.(png|jpg|jpeg|gif|webp|svg|bmp)$/.test(n)) return { Icon: FileImage,       color: "text-purple-500", bg: "bg-purple-50" };
  if (n.endsWith(".pdf"))                             return { Icon: FileText,        color: "text-red-500",    bg: "bg-red-50"    };
  if (/\.(doc|docx)$/.test(n))                        return { Icon: FileText,        color: "text-blue-600",   bg: "bg-blue-50"   };
  if (/\.(xls|xlsx|csv)$/.test(n))                    return { Icon: FileSpreadsheet, color: "text-green-600",  bg: "bg-green-50"  };
  if (/\.(mp4|mov|avi|mkv|webm)$/.test(n))            return { Icon: Film,            color: "text-pink-500",   bg: "bg-pink-50"   };
  if (/\.(mp3|wav|m4a|ogg)$/.test(n))                 return { Icon: Music,           color: "text-yellow-500", bg: "bg-yellow-50" };
  if (/\.(zip|rar|7z|tar|gz)$/.test(n))               return { Icon: Archive,         color: "text-orange-500", bg: "bg-orange-50" };
  return                                                      { Icon: File,            color: "text-slate-500",  bg: "bg-slate-50"  };
}

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

  const [openSection,     setOpenSection]     = useState(null);
  const [userSearch,      setUserSearch]      = useState("");
  const [deptSearch,      setDeptSearch]      = useState("");

  // File attachment state
  const [files,       setFiles]       = useState([]);
  const [previews,    setPreviews]    = useState({});
  const [fileError,   setFileError]   = useState(null);
  const [isDragging,  setIsDragging]  = useState(false);
  const [lightbox,    setLightbox]    = useState(null);
  const dragCounterRef = useRef(0);
  const fileInputRef   = useRef(null);

  const [sending, setSending] = useState(false);
  const [result,  setResult]  = useState(null);

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

  // ── File helpers ──────────────────────────────────────────────────
  const addFiles = useCallback((newFiles) => {
    const allowed  = newFiles.filter(isAllowed);
    const rejected = newFiles.filter(f => !isAllowed(f));
    if (rejected.length) {
      setFileError(`"${rejected.map(f => f.name).join(", ")}" — unsupported format.`);
      if (!allowed.length) return;
    } else {
      setFileError(null);
    }
    setFiles(prev => {
      const combined = [...prev, ...allowed];
      if (combined.length > MAX_FILES)                                          { setFileError(`Maximum ${MAX_FILES} files.`); return prev; }
      if (combined.reduce((s, f) => s + f.size, 0) > MAX_TOTAL_BYTES)         { setFileError("Total size exceeds 20 MB.");   return prev; }
      const newPreviews = {};
      allowed.forEach(f => { if (isImage(f)) newPreviews[f.name + f.size] = URL.createObjectURL(f); });
      setPreviews(p => ({ ...p, ...newPreviews }));
      return combined;
    });
  }, []);

  const removeFile = (idx) => {
    setFiles(prev => {
      const next = [...prev];
      const removed = next.splice(idx, 1)[0];
      const key = removed.name + removed.size;
      if (previews[key]) URL.revokeObjectURL(previews[key]);
      setPreviews(p => { const n = { ...p }; delete n[key]; return n; });
      return next;
    });
    setFileError(null);
  };

  // Paste support
  useEffect(() => {
    const handlePaste = (e) => {
      if (lightbox) return;
      const items = Array.from(e.clipboardData?.items || []);
      const pasted = items.filter(i => i.kind === "file").map(i => i.getAsFile()).filter(Boolean);
      if (pasted.length) { e.preventDefault(); addFiles(pasted); }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [addFiles, lightbox]);

  const onDragEnter = (e) => { e.preventDefault(); dragCounterRef.current++; setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); dragCounterRef.current--; if (dragCounterRef.current === 0) setIsDragging(false); };
  const onDragOver  = (e) => e.preventDefault();
  const onDrop      = (e) => { e.preventDefault(); dragCounterRef.current = 0; setIsDragging(false); const dropped = Array.from(e.dataTransfer.files); if (dropped.length) addFiles(dropped); };

  // ── Send / Targets ────────────────────────────────────────────────
  const toggleAll      = () => { setSendToAll(v => { if (!v) { setTargetDepts([]); setTargetLocations([]); setTargetEmpIds([]); } return !v; }); };
  const toggleDept     = (d) => { setSendToAll(false); setTargetDepts(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]); };
  const toggleLocation = (l) => { setSendToAll(false); setTargetLocations(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]); };
  const toggleUser     = (id) => { setSendToAll(false); setTargetEmpIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); };

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
      const fd = new FormData();
      fd.append("title",       title.trim());
      if (description.trim()) fd.append("description", description.trim());
      fd.append("sendToAll",   String(sendToAll));
      targetDepts.forEach(d     => fd.append("targetDepts",     d));
      targetLocations.forEach(l => fd.append("targetLocations", l));
      targetEmpIds.forEach(id   => fd.append("targetEmpIds",    id));
      files.forEach(f           => fd.append("files",           f));
      const resp = await postForm("/requests/broadcast-send", fd);
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

  const imageFiles    = files.filter(isImage);
  const nonImageFiles = files.filter(f => !isImage(f));

  return (
    <>
      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="preview" className="max-w-full max-h-full rounded-xl object-contain" />
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white"><X size={20}/></button>
        </div>
      )}

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

            {/* ── File Attachment ────────────────────────────────────── */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Attach Files <span className="text-slate-300 font-medium normal-case tracking-normal">— optional · up to {MAX_FILES} files · 20 MB total</span>
              </p>
              <div
                className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
                  isDragging
                    ? "border-indigo-400 bg-indigo-50 scale-[1.01]"
                    : files.length
                    ? "border-slate-200 bg-slate-50"
                    : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/30"
                }`}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-7 gap-2">
                    <Upload className={isDragging ? "text-indigo-400" : "text-slate-300"} size={26} />
                    <p className={`text-[11px] font-bold uppercase tracking-widest ${isDragging ? "text-indigo-500" : "text-slate-400"}`}>
                      {isDragging ? "Drop files here" : "Click or drag files to upload"}
                    </p>
                    <p className="text-[10px] text-slate-300">or press <kbd className="bg-slate-100 text-slate-500 px-1 py-0.5 rounded text-[9px] font-mono">Ctrl+V</kbd> to paste</p>
                  </div>
                ) : (
                  <div className="p-3" onClick={e => e.stopPropagation()}>
                    <div className="space-y-2">
                      {/* Image grid */}
                      {imageFiles.length > 0 && (
                        <div className={`grid gap-1.5 ${imageFiles.length === 1 ? "grid-cols-1" : imageFiles.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                          {imageFiles.map(f => {
                            const key = f.name + f.size;
                            const src = previews[key];
                            const origIdx = files.indexOf(f);
                            return (
                              <div key={key} className="relative group rounded-xl overflow-hidden" style={{ aspectRatio: "1/1" }}>
                                <img src={src} alt={f.name} className="w-full h-full object-cover group-hover:brightness-90 transition-all cursor-pointer" onClick={() => setLightbox(src)} />
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-black/20">
                                  <button onClick={() => setLightbox(src)} className="p-1.5 bg-black/60 rounded-full"><ZoomIn size={13} className="text-white" /></button>
                                </div>
                                <button onClick={() => removeFile(origIdx)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={10}/></button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {/* Non-image files */}
                      {nonImageFiles.map(f => {
                        const { Icon, color, bg } = getIcon(f.name);
                        const origIdx = files.indexOf(f);
                        return (
                          <div key={f.name + f.size} className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-3 py-2">
                            <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}><Icon size={14} className={color} /></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-semibold text-slate-700 truncate">{f.name}</p>
                              <p className="text-[10px] text-slate-400">{(f.size / 1024).toFixed(0)} KB</p>
                            </div>
                            <button onClick={() => removeFile(origIdx)} className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"><X size={12} className="text-slate-400" /></button>
                          </div>
                        );
                      })}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2 rounded-xl border-2 border-dashed border-slate-200 text-[11px] font-bold text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Upload size={12}/> Add more files
                      </button>
                    </div>
                  </div>
                )}
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => { addFiles(Array.from(e.target.files)); e.target.value = ""; }} />
              </div>
              {fileError && <p className="text-[11px] text-red-500 font-bold px-1">{fileError}</p>}
              {files.length > 0 && (
                <p className="text-[10px] text-slate-400 font-medium px-1">{files.length} file{files.length > 1 ? "s" : ""} · {(files.reduce((s, f) => s + f.size, 0) / 1024).toFixed(0)} KB total</p>
              )}
            </div>

            {/* Target selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Send To</label>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${sendToAll ? "bg-indigo-100 text-indigo-700" : (targetDepts.length || targetLocations.length || targetEmpIds.length) ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-500"}`}>
                  {selectionSummary}
                </span>
              </div>

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
                {sending ? "Sending..." : "Send Ticket"}
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
