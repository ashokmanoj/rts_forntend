import { useState, useEffect, useRef, useCallback } from "react";
import {
  X, Upload, ChevronDown, ChevronLeft, ChevronRight,
  FileText, FileSpreadsheet, FileImage,
  Film, Music, Archive, File, Calendar, AlertTriangle, Clipboard, Lock,
  PenLine, Building2, MessageSquare, Paperclip,
} from "lucide-react";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import Spinner from "../ui/Spinner";
import SearchableSelect from "../ui/SearchableSelect";

const DEPARTMENTS = [
  "Academics-Assam","Academics-Karnataka","Academics-Tripura","Academics-Uttarakhand",
  "Accounts-A","Accounts-G","Animation",
  "Broadcasting-Assam","Broadcasting-Karnataka","Broadcasting-Tripura","Broadcasting-Uttarakhand",
  "Business Development","Corporate Communications","Documentation",
  "Facilities","Food Committee","Game Development","Govt. Relations","HR","Management","Marketing",
  "Operations-Assam","Operations-Bihar","Operations-Karnataka","Operations-Maharashtra","Operations-Mizoram","Operations-Nagaland","Operations-Tripura","Operations-Uttarakhand",
  "Purchase","RTS Help Desk","Software","Stores-Assam","Stores-Karnataka","Stores-Mizoram","Stores-Tripura","Stores-Uttarakhand",
  "System Admin-Assam","System Admin-Karnataka","System Admin-Uttarakhand",
  "TA Committee","Technical Support",
];

const ALLOWED_EXTENSIONS = [".jpg",".jpeg",".png",".gif",".webp",".bmp",".svg",".mp4",".mov",".avi",".mkv",".mp3",".wav",".ogg",".pdf",".doc",".docx",".csv",".xlsx",".xls",".zip",".rar",".7z",".tar",".gz"];

function isAllowedFile(file) {
  const t    = file.type;
  const name = (file.name || "").toLowerCase();
  if (t.startsWith("image/") || t.startsWith("video/") || t.startsWith("audio/")) return true;
  if (t === "application/pdf") return true;
  if (t.includes("word") || name.endsWith(".doc") || name.endsWith(".docx")) return true;
  if (t === "text/csv" || name.endsWith(".csv")) return true;
  if (t.includes("excel") || t.includes("spreadsheet") || name.endsWith(".xlsx") || name.endsWith(".xls")) return true;
  if (t.includes("zip") || t.includes("rar") || t.includes("tar") || t.includes("7z")) return true;
  if (ALLOWED_EXTENSIONS.some(ext => name.endsWith(ext))) return true;
  return false;
}

function getFileInfo(file) {
  const t    = file.type;
  const name = (file.name || "").toLowerCase();
  if (t.startsWith("image/"))  return { kind:"image",   label:"Image",       color:"bg-purple-100", iconColor:"text-purple-500" };
  if (t.startsWith("video/"))  return { kind:"video",   label:"Video",       color:"bg-pink-100",   iconColor:"text-pink-500"   };
  if (t.startsWith("audio/"))  return { kind:"audio",   label:"Audio",       color:"bg-yellow-100", iconColor:"text-yellow-500" };
  if (t === "application/pdf") return { kind:"pdf",     label:"PDF",         color:"bg-red-100",    iconColor:"text-red-500"    };
  if (t.includes("word") || name.endsWith(".doc") || name.endsWith(".docx"))
    return { kind:"word",    label:"Word Doc",    color:"bg-blue-100",   iconColor:"text-blue-600"   };
  if (t === "text/csv" || name.endsWith(".csv"))
    return { kind:"csv", label:"CSV File", color:"bg-teal-100", iconColor:"text-teal-600" };
  if (t.includes("excel") || t.includes("spreadsheet") || name.endsWith(".xlsx") || name.endsWith(".xls"))
    return { kind:"excel", label:"Spreadsheet", color:"bg-green-100",  iconColor:"text-green-600"  };
  if (t.includes("zip")||t.includes("rar")||t.includes("tar")||t.includes("7z")||name.endsWith(".zip")||name.endsWith(".rar")||name.endsWith(".7z")||name.endsWith(".tar")||name.endsWith(".gz"))
    return { kind:"archive", label:"Archive",   color:"bg-orange-100", iconColor:"text-orange-500" };
  return { kind:"other", label:"File", color:"bg-slate-100", iconColor:"text-slate-500" };
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

function priorityFromDueDate(dueDate) {
  if (!dueDate) return null;
  const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  if (days < 0)   return { label: "Overdue",  color: "bg-red-600 text-white",    days };
  if (days <= 7)  return { label: "High",     color: "bg-red-100 text-red-700",  days };
  if (days <= 15) return { label: "Medium",   color: "bg-amber-100 text-amber-700", days };
  if (days <= 30) return { label: "Low",      color: "bg-green-100 text-green-700", days };
  return null;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
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

  const toLocal = (str) => { const [y,m,d] = str.split("-").map(Number); return new Date(y, m-1, d); };
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
      {/* Trigger */}
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
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="hover:text-red-500 text-slate-300 transition-colors cursor-pointer"
          >
            <X size={14} />
          </span>
        )}
        {!selectedD && <ChevronDown size={14} className="text-slate-400" />}
      </button>

      {/* Popup calendar */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">

          {/* Month nav header */}
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

          {/* Week day labels */}
          <div className="grid grid-cols-7 bg-indigo-50 px-3 pt-2 pb-1">
            {WEEK_DAYS.map(d => (
              <div key={d} className={`text-center text-[10px] font-black pb-1 ${d === "Su" || d === "Sa" ? "text-rose-400" : "text-indigo-400"}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
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
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  onClick={() => selectDay(day)}
                  className={[
                    "h-8 w-full flex items-center justify-center rounded-xl text-[12px] font-bold transition-all select-none",
                    isPast  ? "text-slate-200 cursor-not-allowed"                                           : "cursor-pointer",
                    isSel   ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105"             : "",
                    isToday && !isSel ? "ring-2 ring-indigo-400 text-indigo-600"                          : "",
                    !isPast && !isSel && isWknd  ? "text-rose-400 hover:bg-rose-50"                       : "",
                    !isPast && !isSel && !isWknd ? "text-slate-700 hover:bg-indigo-50"                    : "",
                  ].join(" ")}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <div className="px-3 pb-3">
            <button
              type="button"
              onClick={() => {
                const t = today;
                onChange(`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`);
                setOpen(false);
              }}
              className="w-full text-center text-[11px] font-black text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 py-2 rounded-xl transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddRequestModal({ onClose, onSubmit, currentUser, initialDept }) {
  const [purpose,      setPurpose]      = useState("");
  const [description,  setDescription]  = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedDept, setSelectedDept] = useState(initialDept || "");
  const [dueDate,      setDueDate]      = useState("");

  const [isDragging,   setIsDragging]   = useState(false);
  const [fileError,    setFileError]    = useState(null);
  const [submitError,  setSubmitError]  = useState(null);
  const [submitting,   setSubmitting]   = useState(false);
  const fileInputRef   = useRef(null);
  const dragCounterRef = useRef(0);

  useEscapeKey(onClose);

  const MAX_FILES     = 10;
  const MAX_TOTAL_MB  = 20;
  const MAX_TOTAL_BYTES = MAX_TOTAL_MB * 1024 * 1024;

  const addFiles = useCallback((newFiles) => {
    if (!newFiles.length) return;

    const allowed  = newFiles.filter(isAllowedFile);
    const rejected = newFiles.filter(f => !isAllowedFile(f));

    if (rejected.length) {
      setFileError(`Unsupported file type${rejected.length > 1 ? "s" : ""}: ${rejected.map(f => f.name).join(", ")}. Allowed: images, video, audio, PDF, Word, Excel, CSV, ZIP, RAR.`);
      if (!allowed.length) return;
    }

    const combined = [...uploadedFiles, ...allowed];

    if (combined.length > MAX_FILES) {
      setFileError(`Maximum ${MAX_FILES} files allowed. If you have more, compress them into a ZIP file and upload that instead.`);
      return;
    }

    const totalBytes = combined.reduce((sum, f) => sum + f.size, 0);
    if (totalBytes > MAX_TOTAL_BYTES) {
      const hasArchive = combined.some(f => {
        const n = f.name.toLowerCase();
        return n.endsWith(".zip") || n.endsWith(".rar") || n.endsWith(".7z") || n.endsWith(".tar") || n.endsWith(".gz") || f.type.includes("zip");
      });
      setFileError(
        hasArchive
          ? `Total size exceeds ${MAX_TOTAL_MB} MB. Your compressed archive is also too large — please split it into smaller parts.`
          : `Total file size exceeds ${MAX_TOTAL_MB} MB. Please compress your files into a ZIP and upload that instead.`
      );
      return;
    }

    if (!rejected.length) setFileError(null);
    setUploadedFiles(combined);
    setImagePreviews(prev => [
      ...prev,
      ...allowed.map(f => f.type.startsWith("image/") ? URL.createObjectURL(f) : null),
    ]);
  }, [uploadedFiles]);

  const handleFileChange = (e) => {
    addFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounterRef.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e) => { e.preventDefault(); };

  const handleDrop = (e) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  // Ctrl+V paste — captures files and screenshots from clipboard
  const handlePaste = useCallback((e) => {
    const files = Array.from(e.clipboardData?.items || [])
      .filter(item => item.kind === "file")
      .map(item => item.getAsFile())
      .filter(Boolean);
    if (files.length) addFiles(files);
  }, [addFiles]);

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const handleRemoveFile = (idx) => {
    const preview = imagePreviews[idx];
    if (preview) URL.revokeObjectURL(preview);
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveAll = () => {
    imagePreviews.forEach(p => p && URL.revokeObjectURL(p));
    setUploadedFiles([]);
    setImagePreviews([]);
    setFileError(null);
  };

  const handleSubmit = async () => {
    if (!purpose.trim() || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        purpose,
        assignedDept:  selectedDept || "",
        assignedDepts: selectedDept || "",
        description,
        files: uploadedFiles.length > 0 ? uploadedFiles : null,
        dueDate: dueDate || null,
        assignedPersonEmpId: null,
        assignedPersonName:  null,
      });
    } catch (err) {
      setSubmitError(err?.response?.data?.error || err?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const urgencyInfo  = priorityFromDueDate(dueDate);

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 max-h-[95dvh] flex flex-col">

        {/* Header */}
        <div className={`p-5 border-b flex justify-between items-center flex-shrink-0 ${initialDept ? "bg-indigo-50/60" : "bg-slate-50/50"}`}>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-slate-800">
              {initialDept ? "RTS Help Desk" : "Add Request"}
            </h2>
            {initialDept && (
              <p className="text-[11px] text-indigo-500 font-bold mt-0.5">Submit a support ticket to the RTS team</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors">
            <X size={22} />
          </button>
        </div>

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

          {/* Dept selector — locked when initialDept is provided */}
          <div className="space-y-1.5">
            {!initialDept && (
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                <Building2 size={10} /> Assign to Department
              </label>
            )}
            {initialDept ? (
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
              <SearchableSelect
                value={selectedDept}
                onChange={setSelectedDept}
                options={DEPARTMENTS}
                placeholder="Select department…"
                triggerClassName="px-5 py-3.5 bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-2xl font-medium text-[13px] transition-all"
              />
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
              ${isDragging
                ? "border-indigo-400 bg-indigo-50 scale-[1.01]"
                : "border-slate-200 bg-slate-50 hover:bg-indigo-50/30 hover:border-indigo-300 group"
              }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Drag-over overlay */}
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
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-[11px] font-black shadow-md active:scale-95 transition-all"
                  >
                    Select Files
                  </button>
                  <span className="text-[10px] text-slate-300 flex items-center gap-1 font-medium">
                    <Clipboard size={9} /> Ctrl+V to paste
                  </span>
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
                            : <FileKindIcon kind={info.kind} iconColor={info.iconColor} size={28} />
                          }
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-10"
                        >
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
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.csv,.xlsx,.xls,.zip,.rar,.7z,.tar,.gz" multiple onChange={handleFileChange} />
          </div>
          </div>

          {fileError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 -mt-1">
              <span className="text-red-500 text-[11px] font-black flex-shrink-0 mt-px">✕</span>
              <p className="text-[11px] text-red-700 leading-relaxed">{fileError}</p>
            </div>
          )}

          {/* Submit error */}
          {submitError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <span className="text-red-500 text-[11px] font-black flex-shrink-0 mt-px">✕</span>
              <p className="text-[11px] text-red-700 leading-relaxed font-medium">{submitError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-[0.4] py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-[13px] active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!purpose.trim() || submitting}
              className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[13px] shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? <><Spinner size={16}/> Submitting…</> : "Submit Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
