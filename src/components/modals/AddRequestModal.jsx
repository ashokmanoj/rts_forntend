import { useState, useEffect, useRef, useCallback } from "react";
import {
  X, Upload, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  FileText, FileSpreadsheet, FileImage,
  Film, Music, Archive, File, Calendar, AlertTriangle, Clipboard, Lock,
  PenLine, Building2, MessageSquare, Paperclip, Users, Check, Repeat2,
} from "lucide-react";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import Spinner from "../ui/Spinner";
import { get } from "../../services/api";

const DEPARTMENTS = [
  "Academics-Assam","Academics-Karnataka","Academics-Mizoram","Academics-Telangana","Academics-Tripura","Academics-Uttarakhand",
  "Accounts-A","Accounts-G","Animation",
  "Broadcasting-Assam","Broadcasting-Karnataka","Broadcasting-Mizoram","Broadcasting-Telangana","Broadcasting-Tripura","Broadcasting-Uttarakhand",
  "Business Development","Corporate Communications","Documentation",
  "Facilities","Food Committee","Game Development","Govt. Relations","HR","Management","Marketing",
  "Operations-Assam","Operations-Bihar","Operations-Karnataka","Operations-Maharashtra","Operations-Mizoram","Operations-Nagaland","Operations-Tripura","Operations-Uttarakhand",
  "Purchase","RTS Help Desk","Software","Stores-Assam","Stores-Karnataka","Stores-Mizoram","Stores-Tripura","Stores-Uttarakhand",
  "System Admin-Assam","System Admin-Karnataka","System Admin-Uttarakhand",
  "TA Committee","Technical Support",
];

const RECURRING_OPTIONS = [
  { value: "1m",  label: "1 Month"   },
  { value: "4m",  label: "4 Months"  },
  { value: "6m",  label: "6 Months"  },
  { value: "1y",  label: "1 Year"    },
];

const ALLOWED_EXTENSIONS = [".jpg",".jpeg",".png",".gif",".webp",".bmp",".svg",".mp4",".mov",".avi",".mkv",".mp3",".wav",".ogg",".pdf",".doc",".docx",".csv",".xlsx",".xls",".zip",".rar",".7z",".tar",".gz",".jar"];

function isAllowedFile(file) {
  const t    = file.type;
  const name = (file.name || "").toLowerCase();
  if (t.startsWith("image/") || t.startsWith("video/") || t.startsWith("audio/")) return true;
  if (t === "application/pdf") return true;
  if (t.includes("word") || name.endsWith(".doc") || name.endsWith(".docx")) return true;
  if (t === "text/csv" || name.endsWith(".csv")) return true;
  if (t.includes("excel") || t.includes("spreadsheet") || name.endsWith(".xlsx") || name.endsWith(".xls")) return true;
  if (t.includes("zip") || t.includes("rar") || t.includes("tar") || t.includes("7z") || t.includes("java-archive") || name.endsWith(".jar")) return true;
  if (ALLOWED_EXTENSIONS.some(ext => name.endsWith(ext))) return true;
  return false;
}

function getFileInfo(file) {
  const t    = file.type;
  const name = (file.name || "").toLowerCase();
  if (t.startsWith("image/"))  return { kind:"image",   color:"bg-purple-100", iconColor:"text-purple-500" };
  if (t.startsWith("video/"))  return { kind:"video",   color:"bg-pink-100",   iconColor:"text-pink-500"   };
  if (t.startsWith("audio/"))  return { kind:"audio",   color:"bg-yellow-100", iconColor:"text-yellow-500" };
  if (t === "application/pdf") return { kind:"pdf",     color:"bg-red-100",    iconColor:"text-red-500"    };
  if (t.includes("word") || name.endsWith(".doc") || name.endsWith(".docx"))
    return { kind:"word",    color:"bg-blue-100",   iconColor:"text-blue-600"   };
  if (t === "text/csv" || name.endsWith(".csv"))
    return { kind:"csv",     color:"bg-teal-100",   iconColor:"text-teal-600"   };
  if (t.includes("excel") || t.includes("spreadsheet") || name.endsWith(".xlsx") || name.endsWith(".xls"))
    return { kind:"excel",   color:"bg-green-100",  iconColor:"text-green-600"  };
  if (t.includes("zip")||t.includes("rar")||t.includes("tar")||t.includes("7z")||name.endsWith(".zip")||name.endsWith(".rar")||name.endsWith(".7z")||name.endsWith(".tar")||name.endsWith(".gz"))
    return { kind:"archive", color:"bg-orange-100", iconColor:"text-orange-500" };
  return { kind:"other", color:"bg-slate-100", iconColor:"text-slate-500" };
}

function FileKindIcon({ kind, iconColor, size = 28 }) {
  const cls = iconColor;
  if (kind === "image")   return <FileImage       size={size} className={cls} />;
  if (kind === "video")   return <Film            size={size} className={cls} />;
  if (kind === "audio")   return <Music           size={size} className={cls} />;
  if (kind === "pdf")     return <FileText        size={size} className={cls} />;
  if (kind === "word")    return <FileText        size={size} className={cls} />;
  if (kind === "csv")     return <FileSpreadsheet size={size} className={cls} />;
  if (kind === "excel")   return <FileSpreadsheet size={size} className={cls} />;
  if (kind === "archive") return <Archive         size={size} className={cls} />;
  return <File size={size} className={cls} />;
}

function formatSize(bytes) {
  if (bytes < 1024)            return `${bytes} B`;
  if (bytes < 1024 * 1024)     return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function roleColor(role) {
  switch (role) {
    case "HOD":          return "bg-purple-100 text-purple-700";
    case "DeptHOD":      return "bg-violet-100 text-violet-700";
    case "RM":           return "bg-blue-100 text-blue-700";
    case "Management":   return "bg-amber-100 text-amber-700";
    case "Admin":        return "bg-red-100 text-red-700";
    case "SuperUser":    return "bg-rose-100 text-rose-700";
    case "HR":           return "bg-pink-100 text-pink-700";
    case "FoodCommittee":return "bg-orange-100 text-orange-700";
    default:             return "bg-slate-100 text-slate-500";
  }
}

function priorityFromDueDate(dueDate) {
  if (!dueDate) return null;
  const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  if (days < 0)   return { label: "Overdue",  color: "bg-red-600 text-white",       days };
  if (days <= 7)  return { label: "High",     color: "bg-red-100 text-red-700",     days };
  if (days <= 15) return { label: "Medium",   color: "bg-amber-100 text-amber-700", days };
  if (days <= 30) return { label: "Low",      color: "bg-green-100 text-green-700", days };
  return null;
}

const MONTHS    = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEK_DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function CalendarPicker({ value, onChange, minDateStr }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const todayParts = new Date();
  const initYear  = value ? parseInt(value.split("-")[0]) : todayParts.getFullYear();
  const initMonth = value ? parseInt(value.split("-")[1]) - 1 : todayParts.getMonth();
  const [viewYear,  setViewYear]  = useState(initYear);
  const [viewMonth, setViewMonth] = useState(initMonth);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toLocal    = (str) => { const [y,m,d] = str.split("-").map(Number); return new Date(y, m-1, d); };
  const today      = new Date(todayParts.getFullYear(), todayParts.getMonth(), todayParts.getDate());
  const minDate    = minDateStr ? toLocal(minDateStr) : today;
  const selectedD  = value ? toLocal(value) : null;
  const firstDow   = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMon  = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => viewMonth === 0 ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1);
  const nextMonth = () => viewMonth === 11 ? (setViewMonth(0),  setViewYear(y => y + 1)) : setViewMonth(m => m + 1);

  const selectDay = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    if (d < minDate) return;
    onChange(`${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`);
    setOpen(false);
  };

  const displayLabel = selectedD
    ? selectedD.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })
    : "Select due date — optional";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 bg-slate-100 hover:bg-slate-200/60 px-5 py-3.5 rounded-2xl font-medium text-[13px] outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
      >
        <Calendar size={15} className="text-indigo-400 flex-shrink-0" />
        <span className={selectedD ? "text-slate-800 font-bold flex-1 text-left" : "text-slate-400 flex-1 text-left"}>
          {displayLabel}
        </span>
        {selectedD && (
          <span role="button" onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="hover:text-red-500 text-slate-300 transition-colors cursor-pointer">
            <X size={14} />
          </span>
        )}
        {!selectedD && <ChevronDown size={14} className="text-slate-400" />}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500">
            <button type="button" onClick={prevMonth}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <div className="text-center">
              <p className="text-white font-black text-[14px] leading-none">{MONTHS[viewMonth]}</p>
              <p className="text-indigo-200 text-[11px] font-bold mt-0.5">{viewYear}</p>
            </div>
            <button type="button" onClick={nextMonth}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-7 bg-indigo-50 px-3 pt-2 pb-1">
            {WEEK_DAYS.map(d => (
              <div key={d} className={`text-center text-[10px] font-black pb-1 ${d === "Su" || d === "Sa" ? "text-rose-400" : "text-indigo-400"}`}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 px-3 py-2 gap-y-1">
            {Array.from({ length: firstDow }).map((_, i) => <div key={`g${i}`} />)}
            {Array.from({ length: daysInMon }).map((_, i) => {
              const day      = i + 1;
              const thisDate = new Date(viewYear, viewMonth, day);
              const isPast   = thisDate < minDate;
              const isToday  = thisDate.getTime() === today.getTime();
              const isSel    = selectedD && thisDate.getTime() === selectedD.getTime();
              const isWknd   = thisDate.getDay() === 0 || thisDate.getDay() === 6;
              return (
                <button key={day} type="button" disabled={isPast} onClick={() => selectDay(day)}
                  className={[
                    "h-8 w-full flex items-center justify-center rounded-xl text-[12px] font-bold transition-all select-none",
                    isPast  ? "text-slate-200 cursor-not-allowed" : "cursor-pointer",
                    isSel   ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105" : "",
                    isToday && !isSel ? "ring-2 ring-indigo-400 text-indigo-600" : "",
                    !isPast && !isSel && isWknd  ? "text-rose-400 hover:bg-rose-50" : "",
                    !isPast && !isSel && !isWknd ? "text-slate-700 hover:bg-indigo-50" : "",
                  ].join(" ")}
                >{day}</button>
              );
            })}
          </div>
          <div className="px-3 pb-3">
            <button type="button"
              onClick={() => {
                const t = today;
                onChange(`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`);
                setOpen(false);
              }}
              className="w-full text-center text-[11px] font-black text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 py-2 rounded-xl transition-colors"
            >Today</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddRequestModal({ onClose, onSubmit, currentUser, initialDept }) {
  // ── Core fields ──────────────────────────────────────────────────────────────
  const [purpose,       setPurpose]      = useState("");
  const [description,   setDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [dueDate,       setDueDate]      = useState("");
  const [isDragging,    setIsDragging]   = useState(false);
  const [fileError,     setFileError]    = useState(null);
  const [submitError,   setSubmitError]  = useState(null);
  const [submitting,    setSubmitting]   = useState(false);
  const fileInputRef   = useRef(null);
  const dragCounterRef = useRef(0);

  // ── Multi-dept + user selection ───────────────────────────────────────────────
  const [selectedDepts,   setSelectedDepts]   = useState(initialDept ? [initialDept] : []);
  const [deptPickerOpen,  setDeptPickerOpen]  = useState(false);
  const [deptSearch,      setDeptSearch]      = useState("");
  const [deptUsers,       setDeptUsers]       = useState({});     // { deptName: User[] }
  const [loadingDepts,    setLoadingDepts]    = useState(new Set()); // depts currently fetching
  const [selectedEmpIds,  setSelectedEmpIds]  = useState(new Set());
  const [expandedDepts,   setExpandedDepts]   = useState(new Set()); // depts with user panel open
  const deptPickerRef = useRef(null);

  // ── Recurring ────────────────────────────────────────────────────────────────
  const [recurringType,     setRecurringType]     = useState("one-time");
  const [recurringInterval, setRecurringInterval] = useState("1m");

  // ── Draft persistence ─────────────────────────────────────────────────────────
  const DRAFT_KEY    = `rts_draft_${initialDept ? "helpdesk" : "request"}_${currentUser?.empId}`;
  const [draftBanner, setDraftBanner] = useState(false);
  const saveTimerRef  = useRef(null);

  // Restore draft on mount
  useEffect(() => {
    if (!currentUser?.empId) return;
    let restoredDepts  = [];
    let restoredEmpIds = new Set();
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.purpose)           setPurpose(d.purpose);
      if (d.description)       setDescription(d.description);
      if (d.dueDate)           setDueDate(d.dueDate);
      if (d.recurringType)     setRecurringType(d.recurringType);
      if (d.recurringInterval) setRecurringInterval(d.recurringInterval);
      if (!initialDept && Array.isArray(d.selectedDepts) && d.selectedDepts.length) {
        setSelectedDepts(d.selectedDepts);
        restoredDepts = d.selectedDepts;
      }
      if (Array.isArray(d.selectedEmpIds) && d.selectedEmpIds.length) {
        restoredEmpIds = new Set(d.selectedEmpIds);
        setSelectedEmpIds(restoredEmpIds);
      }
      const hasData = d.purpose || d.description || d.dueDate || restoredDepts.length || restoredEmpIds.size;
      if (hasData) setDraftBanner(true);
    } catch {}
    // Auto-load users for restored depts so selectedEmpIds are available at submit time
    if (restoredDepts.length && restoredEmpIds.size) {
      restoredDepts.forEach(async (dept) => {
        try {
          const data  = await get(`/requests/users-by-dept?depts=${encodeURIComponent(dept)}`);
          const users = filterAssignable(Array.isArray(data) ? data : (data?.data ?? []));
          setDeptUsers(prev => ({ ...prev, [dept]: users }));
        } catch {}
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save draft to localStorage (debounced 600 ms)
  useEffect(() => {
    if (!currentUser?.empId) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        const hasData = purpose || description || dueDate || selectedDepts.length || selectedEmpIds.size;
        if (!hasData) return;
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
          purpose,
          description,
          dueDate,
          recurringType,
          recurringInterval,
          selectedDepts: initialDept ? [] : selectedDepts,
          selectedEmpIds: [...selectedEmpIds],
        }));
      } catch {}
    }, 600);
    return () => clearTimeout(saveTimerRef.current);
  }, [purpose, description, dueDate, recurringType, recurringInterval, selectedDepts, selectedEmpIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    setDraftBanner(false);
  };

  useEscapeKey(onClose);

  // Only show RM and HOD-level users in the picker (exclude Requestor, Intern, etc.)
  const ASSIGNABLE_ROLES = new Set(["RM", "HOD", "DeptHOD"]);
  const filterAssignable = (users) =>
    users.filter(u => {
      const roles = u.roles?.map(r => r.role) || [u.role];
      return roles.some(r => ASSIGNABLE_ROLES.has(r));
    });

  // Load users for a specific dept (lazy — only when arrow is clicked)
  const loadUsersForDept = useCallback(async (dept) => {
    if (deptUsers[dept] !== undefined) return; // already loaded
    setLoadingDepts(prev => new Set(prev).add(dept));
    try {
      const data  = await get(`/requests/users-by-dept?depts=${encodeURIComponent(dept)}`);
      const users = filterAssignable(Array.isArray(data) ? data : (data?.data ?? []));
      setDeptUsers(prev => ({ ...prev, [dept]: users }));
    } catch {
      setDeptUsers(prev => ({ ...prev, [dept]: [] }));
    } finally {
      setLoadingDepts(prev => { const n = new Set(prev); n.delete(dept); return n; });
    }
  }, [deptUsers]); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle dept user panel — single selection (closes others, opens right panel)
  const toggleDeptExpand = (dept) => {
    setExpandedDepts(prev => {
      if (prev.has(dept)) return new Set();   // click same → close
      return new Set([dept]);                  // click new → switch
    });
    loadUsersForDept(dept);
  };

  // Close dept picker on outside click
  useEffect(() => {
    const handler = (e) => {
      if (deptPickerRef.current && !deptPickerRef.current.contains(e.target))
        setDeptPickerOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Dept helpers ─────────────────────────────────────────────────────────────
  const toggleDept = (dept) => {
    if (initialDept) return;
    setSelectedDepts(prev => {
      if (prev.includes(dept)) {
        // Remove dept — deselect its users and collapse its panel
        const users = deptUsers[dept] || [];
        setSelectedEmpIds(ids => {
          const next = new Set(ids);
          users.forEach(u => next.delete(u.empId));
          return next;
        });
        setExpandedDepts(e => { const n = new Set(e); n.delete(dept); return n; });
        setDeptUsers(g => { const n = { ...g }; delete n[dept]; return n; });
        return prev.filter(d => d !== dept);
      }
      return [...prev, dept];
    });
  };

  const toggleUser = (empId) => {
    setSelectedEmpIds(prev => {
      const next = new Set(prev);
      if (next.has(empId)) next.delete(empId); else next.add(empId);
      return next;
    });
  };

  const toggleAllInDept = (dept, e) => {
    e.stopPropagation();
    const users     = deptUsers[dept] || [];
    const selectable = users.filter(u => u.empId !== currentUser?.empId);
    const allSel    = selectable.length > 0 && selectable.every(u => selectedEmpIds.has(u.empId));
    setSelectedEmpIds(prev => {
      const next = new Set(prev);
      if (allSel) selectable.forEach(u => next.delete(u.empId));
      else        selectable.forEach(u => next.add(u.empId));
      return next;
    });
  };

  // ── File handling ─────────────────────────────────────────────────────────────
  const MAX_FILES       = 10;
  const MAX_TOTAL_BYTES = 20 * 1024 * 1024;

  const addFiles = useCallback((newFiles) => {
    if (!newFiles.length) return;
    const allowed  = newFiles.filter(isAllowedFile);
    const rejected = newFiles.filter(f => !isAllowedFile(f));
    if (rejected.length) {
      const names = rejected.map(f => f.name).join(", ");
      setFileError(
        `"${names}" — unsupported format.\n` +
        `Allowed: Images · PDF · Word (doc/docx) · Excel (xlsx/xls) · CSV · Video · Audio · Archives (zip/rar/7z/jar)`
      );
      if (!allowed.length) return;
    }
    const combined = [...uploadedFiles, ...allowed];
    if (combined.length > MAX_FILES)      { setFileError(`Maximum ${MAX_FILES} files.`); return; }
    const totalBytes = combined.reduce((s, f) => s + f.size, 0);
    if (totalBytes > MAX_TOTAL_BYTES)     { setFileError("Total size exceeds 20 MB."); return; }
    if (!rejected.length) setFileError(null);
    setUploadedFiles(combined);
    setImagePreviews(prev => [...prev, ...allowed.map(f => f.type.startsWith("image/") ? URL.createObjectURL(f) : null)]);
  }, [uploadedFiles]);

  const handleFileChange  = (e)   => { addFiles(Array.from(e.target.files)); e.target.value = ""; };
  const handleDragEnter   = (e)   => { e.preventDefault(); dragCounterRef.current++; setIsDragging(true); };
  const handleDragLeave   = (e)   => { e.preventDefault(); dragCounterRef.current--; if (dragCounterRef.current === 0) setIsDragging(false); };
  const handleDragOver    = (e)   => { e.preventDefault(); };
  const handleDrop        = (e)   => { e.preventDefault(); dragCounterRef.current = 0; setIsDragging(false); addFiles(Array.from(e.dataTransfer.files)); };
  const handleRemoveFile  = (idx) => { const p = imagePreviews[idx]; if (p) URL.revokeObjectURL(p); setImagePreviews(prev => prev.filter((_, i) => i !== idx)); setUploadedFiles(prev => prev.filter((_, i) => i !== idx)); };
  const handleRemoveAll   = ()    => { imagePreviews.forEach(p => p && URL.revokeObjectURL(p)); setUploadedFiles([]); setImagePreviews([]); setFileError(null); };

  const handlePaste = useCallback((e) => {
    const files = Array.from(e.clipboardData?.items || []).filter(i => i.kind === "file").map(i => i.getAsFile()).filter(Boolean);
    if (files.length) addFiles(files);
  }, [addFiles]);

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!purpose.trim() || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    const primaryDept   = selectedDepts[0] || "";
    const allUsers      = Object.values(deptUsers).flat();
    const selectedUsers = allUsers.filter(u => selectedEmpIds.has(u.empId));

    try {
      await onSubmit({
        purpose,
        assignedDept:        primaryDept,
        assignedDepts:       selectedDepts.join(",") || primaryDept,
        description,
        files:               uploadedFiles.length > 0 ? uploadedFiles : null,
        dueDate:             dueDate || null,
        assignedPersonEmpId: selectedUsers.length ? selectedUsers.map(u => u.empId).join(",") : null,
        assignedPersonName:  selectedUsers.length ? selectedUsers.map(u => u.name).join(",")  : null,
        isRecurring:         recurringType === "recurring",
        recurringInterval:   recurringType === "recurring" ? recurringInterval : null,
      });
      // Clear draft only on successful submit
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
    } catch (err) {
      setSubmitError(err?.response?.data?.error || err?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const urgencyInfo     = priorityFromDueDate(dueDate);
  const today           = new Date().toISOString().split("T")[0];
  const filteredDepts   = DEPARTMENTS.filter(d => d.toLowerCase().includes(deptSearch.toLowerCase()));
  const totalSelected   = selectedEmpIds.size;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 max-h-[95dvh] flex flex-col">

        {/* Header */}
        <div className={`p-5 border-b flex justify-between items-center flex-shrink-0 ${initialDept ? "bg-indigo-50/60" : "bg-slate-50/50"}`}>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-slate-800">
              {initialDept ? "RTS Help Desk" : "Add Request"}
            </h2>
            {initialDept && <p className="text-[11px] text-indigo-500 font-bold mt-0.5">Submit a support ticket to the RTS team</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Draft restored banner */}
        {draftBanner && (
          <div className="flex items-center justify-between gap-2 bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex-shrink-0">
            <p className="text-[13px] font-bold text-amber-700">
              Draft restored — attachments need to be re-added.
            </p>
            <div className="flex items-center gap-3">
              <button onClick={clearDraft} className="text-[13px] font-black text-amber-600 hover:text-red-600 transition-colors underline underline-offset-2 whitespace-nowrap">
                Clear draft
              </button>
              <button onClick={() => setDraftBanner(false)} className="text-amber-500 hover:text-amber-700 transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <div className="p-6 space-y-4 overflow-y-auto flex-1">

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
              <PenLine size={10} /> Request Title <span className="text-red-400">*</span>
            </label>
            <input
              className="w-full bg-slate-50 border-2 border-slate-200 hover:border-slate-300 focus:border-indigo-400 focus:bg-white px-5 py-3.5 rounded-2xl font-semibold outline-none text-[15px] text-slate-800 placeholder:text-slate-300 transition-all"
              placeholder="What do you need help with?"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          {/* Your Department */}
          {currentUser?.dept && (
            <div className="flex items-center gap-3 bg-indigo-50 border-2 border-indigo-200 rounded-2xl px-5 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Lock size={14} className="text-indigo-500" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-0.5">Your Department</p>
                <p className="text-[15px] font-black text-indigo-700">{currentUser.dept}</p>
              </div>
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200">Locked</span>
            </div>
          )}

          {/* ── Assign to Department(s) ─────────────────────────────────────── */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
              <Building2 size={10} /> Assign to Department{!initialDept && "s"}
            </label>

            {initialDept ? (
              /* Locked dept */
              <div className="flex items-center gap-3 bg-indigo-50 border-2 border-indigo-200 rounded-2xl px-5 py-3.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Lock size={14} className="text-indigo-500" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-0.5">Assigned Department</p>
                  <p className="text-[15px] font-black text-indigo-700">{initialDept}</p>
                </div>
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200">Fixed</span>
              </div>
            ) : (
              /* ── Multi-dept picker + inline user expansion ───────────────── */
              <div ref={deptPickerRef} className="relative">

                {/* Trigger */}
                <button
                  type="button"
                  onClick={() => setDeptPickerOpen(p => !p)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl border-2 font-medium text-[13px] transition-all text-left ${
                    selectedDepts.length
                      ? "bg-indigo-50 border-indigo-300"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Building2 size={14} className={selectedDepts.length ? "text-indigo-500" : "text-slate-400"} />
                  <span className={`flex-1 ${selectedDepts.length ? "text-indigo-700" : "text-slate-400"}`}>
                    {selectedDepts.length
                      ? `${selectedDepts.length} department${selectedDepts.length > 1 ? "s" : ""} selected`
                      : "Select department(s)…"}
                  </span>
                  {selectedDepts.length > 0 && (
                    <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {selectedDepts.length}
                    </span>
                  )}
                  {deptPickerOpen
                    ? <ChevronUp   size={14} className="text-slate-400 flex-shrink-0" />
                    : <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />}
                </button>

                {/* Dropdown — two-panel layout */}
                {deptPickerOpen && (() => {
                  const activeDept    = [...expandedDepts][0] ?? null;
                  const activeUsers   = activeDept ? (deptUsers[activeDept] || []) : [];
                  const activeLoading = activeDept ? loadingDepts.has(activeDept) : false;
                  const activeSelectable = activeUsers.filter(u => u.empId !== currentUser?.empId);
                  const activeSelCount   = activeSelectable.filter(u => selectedEmpIds.has(u.empId)).length;

                  return (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex">

                    {/* LEFT — dept list */}
                    <div className={`flex flex-col ${activeDept ? "w-1/2 border-r border-slate-100" : "w-full"}`}>
                      <div className="p-2 border-b border-slate-100">
                        <input
                          autoFocus
                          type="text"
                          value={deptSearch}
                          onChange={e => setDeptSearch(e.target.value)}
                          placeholder="Search departments…"
                          className="w-full px-3 py-2 text-[12px] font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400"
                        />
                      </div>
                      <div className="max-h-64 overflow-y-auto py-1">
                        {filteredDepts.length === 0 ? (
                          <p className="text-center text-[11px] text-slate-400 py-4">No departments found</p>
                        ) : filteredDepts.map(dept => {
                          const checked    = selectedDepts.includes(dept);
                          const expanded   = expandedDepts.has(dept);
                          const loading    = loadingDepts.has(dept);
                          const users      = deptUsers[dept] || [];
                          const selectable = users.filter(u => u.empId !== currentUser?.empId);
                          const selCount   = selectable.filter(u => selectedEmpIds.has(u.empId)).length;

                          return (
                            <div key={dept} className={`flex items-center transition-colors ${checked ? "bg-indigo-50/60" : "hover:bg-slate-50"}`}>
                              {/* Checkbox + name */}
                              <button
                                type="button"
                                onClick={() => toggleDept(dept)}
                                className="flex items-center gap-3 flex-1 px-4 py-2.5 text-left min-w-0"
                              >
                                <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                                  checked ? "bg-indigo-600 border-indigo-600" : "border-slate-300"
                                }`}>
                                  {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                                </span>
                                <span className={`text-[12px] font-medium truncate flex-1 ${checked ? "text-indigo-700 font-semibold" : "text-slate-700"}`}>
                                  {dept}
                                </span>
                                {checked && selectable.length > 0 && (
                                  <span className="text-[10px] font-black text-indigo-400 bg-indigo-100 px-1.5 py-0.5 rounded-md flex-shrink-0">
                                    {selCount}/{selectable.length}
                                  </span>
                                )}
                              </button>

                              {/* Person pill → opens right panel */}
                              {checked && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); toggleDeptExpand(dept); }}
                                  title="Select persons to notify"
                                  className={`flex items-center gap-1 mr-2 px-2 py-1 rounded-lg text-[11px] font-black transition-all border flex-shrink-0 ${
                                    expanded
                                      ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                                      : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                                  }`}
                                >
                                  <Users size={12} />
                                  <span>Person</span>
                                  {loading
                                    ? <Spinner size={10} />
                                    : <ChevronRight size={11} className={expanded ? "text-indigo-500" : ""} />}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer: clear + done — left panel */}
                      <div className="p-2 border-t border-slate-100 flex items-center justify-between px-3">
                        {selectedDepts.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDepts([]);
                              setDeptUsers({});
                              setSelectedEmpIds(new Set());
                              setExpandedDepts(new Set());
                            }}
                            className="text-[11px] font-black text-red-500 hover:text-red-700 transition-colors"
                          >
                            Clear all
                          </button>
                        ) : <span />}
                        <button
                          type="button"
                          onClick={() => setDeptPickerOpen(false)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black px-4 py-1.5 rounded-xl transition-colors active:scale-95"
                        >
                          Done
                        </button>
                      </div>
                    </div>{/* end left panel */}

                    {/* RIGHT — person panel */}
                    {activeDept && (
                      <div className="w-1/2 flex flex-col">
                        {/* Header */}
                        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="text-[11px] font-black text-indigo-700 truncate">{activeDept}</p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {activeLoading ? "Loading…" : `${activeSelCount} of ${activeSelectable.length} selected`}
                            </p>
                          </div>
                          {!activeLoading && activeSelectable.length > 0 && (
                            <button
                              type="button"
                              onClick={(e) => toggleAllInDept(activeDept, e)}
                              className="text-[10px] font-black text-indigo-500 hover:text-indigo-700 transition-colors flex-shrink-0 ml-2"
                            >
                              {activeSelCount === activeSelectable.length ? "Deselect All" : "Select All"}
                            </button>
                          )}
                        </div>

                        {/* Person list */}
                        <div className="flex-1 overflow-y-auto max-h-[14rem] py-1">
                          {activeLoading ? (
                            <div className="flex items-center gap-2 px-4 py-3 text-[11px] text-slate-400">
                              <Spinner size={13} /> Loading persons…
                            </div>
                          ) : activeUsers.length === 0 ? (
                            <p className="px-4 py-3 text-[11px] text-slate-400 italic">No active users found.</p>
                          ) : activeUsers.map(u => {
                            const isChecked = selectedEmpIds.has(u.empId);
                            return (
                              <button
                                key={u.empId}
                                type="button"
                                onClick={() => toggleUser(u.empId)}
                                className={`w-full flex items-center gap-2 px-4 py-2 text-left transition-colors ${
                                  isChecked ? "bg-emerald-50/70" : "hover:bg-slate-50"
                                }`}
                              >
                                <span className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                                  isChecked ? "bg-emerald-500 border-emerald-500" : "border-slate-300"
                                }`}>
                                  {isChecked && <Check size={9} className="text-white" strokeWidth={3} />}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[12px] font-semibold text-slate-800 truncate">{u.name}</p>
                                  <div className="flex items-center gap-1 flex-wrap mt-0.5">
                                    {(u.roles?.length
                                      ? [...new Set(u.roles.map(r => r.role))]
                                      : [u.role]
                                    ).map(r => (
                                      <span key={r} className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${roleColor(r)}`}>
                                        {r}
                                      </span>
                                    ))}
                                    {u.designation && (
                                      <span className="text-[9px] text-slate-400 truncate">{u.designation}</span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-[9px] text-slate-300 flex-shrink-0">{u.empId}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })()}

                {/* Selected dept pills (shown below trigger when picker is closed) */}
                {selectedDepts.length > 0 && !deptPickerOpen && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedDepts.map(dept => {
                      const users    = deptUsers[dept] || [];
                      const selCount = users.filter(u => selectedEmpIds.has(u.empId)).length;
                      return (
                        <span key={dept} className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 text-[11px] font-bold px-3 py-1 rounded-full border border-indigo-200">
                          {dept}
                          {users.length > 0 && (
                            <span className="text-[9px] text-indigo-400">({selCount}/{users.length})</span>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleDept(dept)}
                            className="hover:text-red-500 text-indigo-300 transition-colors ml-0.5"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── One Time / Recurring ────────────────────────────────────────── */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
              <Repeat2 size={10} /> Request Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRecurringType("one-time")}
                className={`flex-1 py-2.5 rounded-xl text-[12px] font-black transition-all border-2 ${
                  recurringType === "one-time"
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                One Time
              </button>
              <button
                type="button"
                onClick={() => setRecurringType("recurring")}
                className={`flex-1 py-2.5 rounded-xl text-[12px] font-black transition-all border-2 flex items-center justify-center gap-1.5 ${
                  recurringType === "recurring"
                    ? "bg-violet-600 border-violet-600 text-white shadow-md"
                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                <Repeat2 size={13} /> Recurring
              </button>
            </div>

            {recurringType === "recurring" && (
              <div className="bg-violet-50 border-2 border-violet-100 rounded-2xl p-3 space-y-2">
                <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest">Repeat Every</p>
                <div className="flex flex-wrap gap-2">
                  {RECURRING_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRecurringInterval(opt.value)}
                      className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black transition-all border-2 ${
                        recurringInterval === opt.value
                          ? "bg-violet-600 border-violet-600 text-white shadow-sm"
                          : "bg-white border-violet-200 text-violet-600 hover:border-violet-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-violet-400 font-medium">
                  A new request will be auto-created every {RECURRING_OPTIONS.find(o => o.value === recurringInterval)?.label?.toLowerCase()}.
                </p>
              </div>
            )}
          </div>

          {/* Due date */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
              <Calendar size={10} /> Required By <span className="text-slate-300 font-medium normal-case tracking-normal">— optional</span>
            </label>
            <CalendarPicker value={dueDate} onChange={setDueDate} minDateStr={today} />
            {urgencyInfo && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black ${urgencyInfo.color}`}>
                <AlertTriangle size={13} />
                <span>Urgency: {urgencyInfo.label}</span>
                <span className="ml-auto font-medium">
                  {urgencyInfo.days < 0 ? "Overdue!" : urgencyInfo.days === 0 ? "Due today" : `${urgencyInfo.days} day${urgencyInfo.days !== 1 ? "s" : ""} remaining`}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
              <MessageSquare size={10} /> Description <span className="text-slate-300 font-medium normal-case tracking-normal">— optional</span>
            </label>
            <textarea
              className="w-full bg-slate-50 border-2 border-slate-200 hover:border-slate-300 focus:border-indigo-400 focus:bg-white px-5 py-3.5 rounded-2xl text-left h-28 resize-none font-medium outline-none text-[14px] text-slate-800 placeholder:text-slate-300 transition-all"
              placeholder="Describe your request in detail…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Upload zone */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
              <Paperclip size={10} /> Attachments <span className="text-slate-300 font-medium normal-case tracking-normal">— optional</span>
            </label>
            <div
              className={`relative border-2 border-dashed min-h-[130px] flex flex-col items-center justify-center rounded-2xl transition-all duration-200 overflow-hidden p-4
                ${isDragging ? "border-indigo-400 bg-indigo-50 scale-[1.01]" : "border-slate-200 bg-slate-50 hover:bg-indigo-50/30 hover:border-indigo-300 group"}`}
              onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
            >
              {isDragging && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-50/90 z-10 pointer-events-none rounded-2xl">
                  <Upload size={36} className="text-indigo-500 mb-2 animate-bounce" />
                  <p className="text-indigo-600 font-black text-sm">Drop files here</p>
                </div>
              )}
              {uploadedFiles.length === 0 ? (
                <>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${isDragging ? "bg-indigo-100" : "bg-slate-100 group-hover:bg-indigo-100"}`}>
                    <Upload className={`transition-colors ${isDragging ? "text-indigo-500" : "text-slate-400 group-hover:text-indigo-500"}`} size={22} />
                  </div>
                  <p className="text-[13px] font-black text-slate-500 group-hover:text-indigo-600 transition-colors">Drop files here or browse</p>
                  <p className="text-[10px] text-slate-300 font-medium mt-0.5">Images · PDF · Excel · Word · ZIP — max 10 files / 20 MB</p>
                  <div className="flex items-center gap-3 mt-3">
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-[11px] font-black shadow-md active:scale-95 transition-all">
                      Select Files
                    </button>
                    <span className="text-[10px] text-slate-300 flex items-center gap-1 font-medium"><Clipboard size={9} /> Ctrl+V to paste</span>
                  </div>
                </>
              ) : (
                <div className="w-full space-y-3">
                  <div className="flex flex-wrap gap-3 justify-center">
                    {uploadedFiles.map((f, idx) => {
                      const info    = getFileInfo(f);
                      const preview = imagePreviews[idx];
                      return (
                        <div key={idx} className="relative flex-shrink-0 flex flex-col items-center">
                          <div className={`w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center ${info.color} border-2 border-white shadow-sm`}>
                            {info.kind === "image" && preview
                              ? <img src={preview} alt={f.name} className="w-full h-full object-cover" />
                              : <FileKindIcon kind={info.kind} iconColor={info.iconColor} size={28} />}
                          </div>
                          <button type="button" onClick={() => handleRemoveFile(idx)}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-10">
                            <X size={10} />
                          </button>
                          <p className="text-[8px] text-slate-500 font-medium mt-1 truncate w-20 text-center" title={f.name}>{f.name}</p>
                          <p className="text-[8px] text-slate-400">{formatSize(f.size)}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[11px] text-indigo-600 font-bold hover:underline">+ Add more</button>
                    <span className="text-slate-300 text-xs">|</span>
                    <span className="text-[10px] text-slate-300 flex items-center gap-1"><Clipboard size={9} /> Ctrl+V to paste</span>
                    <span className="text-slate-300 text-xs">|</span>
                    <button type="button" onClick={handleRemoveAll} className="text-[11px] text-red-500 font-bold hover:underline">Remove all</button>
                  </div>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden"
                accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.csv,.xlsx,.xls,.zip,.rar,.7z,.tar,.gz,.jar"
                multiple onChange={handleFileChange} />
            </div>
          </div>

          {fileError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 -mt-1">
              <span className="text-red-500 text-[11px] font-black flex-shrink-0 mt-px">✕</span>
              <div className="text-[11px] text-red-700 leading-relaxed">
                {fileError.split("\n").map((line, i) => (
                  <p key={i} className={i === 1 ? "text-red-500 mt-0.5" : "font-bold"}>{line}</p>
                ))}
              </div>
            </div>
          )}

          {submitError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <span className="text-red-500 text-[11px] font-black flex-shrink-0 mt-px">✕</span>
              <p className="text-[11px] text-red-700 leading-relaxed font-medium">{submitError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-[0.4] py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-[13px] active:scale-95 transition-all">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={!purpose.trim() || submitting}
              className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[13px] shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center justify-center gap-2">
              {submitting ? <><Spinner size={16}/> Submitting…</> : "Submit Request"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
