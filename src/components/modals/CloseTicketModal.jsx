import { useState, useCallback, useRef, useEffect } from "react";
import { X, Upload, Paperclip, FileText, FileSpreadsheet, FileImage, Film, Music, Archive, File, Download, ZoomIn } from "lucide-react";
import { sanitizeHtml } from "../../utils/sanitize";
import { hasLinks } from "../../utils/linkUtils";
import RichTextArea from "../ui/RichTextArea";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import Spinner from "../ui/Spinner";

const ALLOWED_EXTENSIONS = [".jpg",".jpeg",".png",".gif",".webp",".bmp",".svg",".mp4",".mov",".avi",".mkv",".mp3",".wav",".ogg",".pdf",".doc",".docx",".csv",".xlsx",".xls",".zip",".rar",".7z",".tar",".gz",".jar"];
const MAX_FILES       = 10;
const MAX_TOTAL_BYTES = 20 * 1024 * 1024;

function isAllowedFile(f) {
  const ext = "." + (f.name || "").split(".").pop().toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

function getFileIcon(name = "") {
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

function isImageFile(f) {
  return f.type.startsWith("image/");
}

const RTS_HELPDESK_DEFAULT_NOTE = "The issue has been resolved, Kindly check and acknowledge by selecting resolved. In case the problem persists please feel free to raise new ticket.";

export default function CloseTicketModal({ req, onClose, onConfirmClose }) {
  const [note,        setNote]        = useState(req?.assignedDept === "RTS Help Desk" ? RTS_HELPDESK_DEFAULT_NOTE : "");
  const [files,       setFiles]       = useState([]);
  const [previews,    setPreviews]    = useState({}); // { name: objectUrl }
  const [fileError,   setFileError]   = useState(null);
  const [isDragging,  setIsDragging]  = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [lightbox,    setLightbox]    = useState(null);
  const dragCounterRef = useRef(0);
  const fileInputRef   = useRef(null);

  useEscapeKey(loading ? null : (lightbox ? () => setLightbox(null) : onClose));

  const addFiles = useCallback((newFiles) => {
    const allowed  = newFiles.filter(isAllowedFile);
    const rejected = newFiles.filter(f => !isAllowedFile(f));
    if (rejected.length) {
      setFileError(`"${rejected.map(f => f.name).join(", ")}" — unsupported format.`);
      if (!allowed.length) return;
    } else {
      setFileError(null);
    }
    const combined = [...files, ...allowed];
    if (combined.length > MAX_FILES)      { setFileError(`Maximum ${MAX_FILES} files.`); return; }
    if (combined.reduce((s, f) => s + f.size, 0) > MAX_TOTAL_BYTES) { setFileError("Total size exceeds 20 MB."); return; }

    const newPreviews = {};
    allowed.forEach(f => { if (isImageFile(f)) newPreviews[f.name + f.size] = URL.createObjectURL(f); });
    setFiles(combined);
    setPreviews(prev => ({ ...prev, ...newPreviews }));
  }, [files]);

  // Clipboard paste support (Ctrl+V anywhere in the modal)
  useEffect(() => {
    const handlePaste = (e) => {
      if (lightbox) return;
      const items = Array.from(e.clipboardData?.items || []);
      const pastedFiles = items
        .filter(item => item.kind === "file")
        .map(item => item.getAsFile())
        .filter(Boolean);
      if (pastedFiles.length) {
        e.preventDefault();
        addFiles(pastedFiles);
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [addFiles, lightbox]);

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

  const onDragEnter = (e) => { e.preventDefault(); dragCounterRef.current++; setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); dragCounterRef.current--; if (dragCounterRef.current === 0) setIsDragging(false); };
  const onDragOver  = (e) => e.preventDefault();
  const onDrop      = (e) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) addFiles(dropped);
  };

  const handleConfirm = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onConfirmClose(req.id, note, files);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="preview" className="max-w-full max-h-full rounded-xl object-contain" />
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white"><X size={20}/></button>
        </div>
      )}

      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg border border-slate-200 max-h-[95dvh] flex flex-col">

          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center bg-slate-50/50 flex-shrink-0 rounded-t-[2rem]">
            <h2 className="text-lg font-black uppercase tracking-tighter text-slate-800">🔒 Close Ticket — #{req?.id}</h2>
            <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"><X size={20}/></button>
          </div>

          <div className="p-5 space-y-4 overflow-y-auto flex-1">

            {/* Resolution note */}
            <div className="space-y-1.5">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Resolution Note</p>
              <RichTextArea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Describe how the ticket was resolved…"
                rows={4}
              />
              {/* Live preview */}
              {note.trim() && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                  <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest mb-1">Preview</p>
                  <div
                    className="text-[11px] text-slate-600 leading-relaxed break-words [&_ul]:list-disc [&_ul]:list-inside [&_mark]:bg-yellow-200 [&_mark]:rounded-sm [&_b]:font-bold [&_strong]:font-bold [&_u]:underline"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(note) }}
                  />
                </div>
              )}
            </div>

            {/* File upload zone */}
            <div className="space-y-2">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Attach Files <span className="text-slate-300 font-medium normal-case tracking-normal">— optional, up to {MAX_FILES} files · 20 MB total</span></p>

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
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Upload className={`${isDragging ? "text-indigo-400" : "text-slate-300"}`} size={28} />
                    <p className={`text-[11px] font-bold uppercase tracking-widest ${isDragging ? "text-indigo-500" : "text-slate-400"}`}>
                      {isDragging ? "Drop files here" : "Click or drag files to upload"}
                    </p>
                    <p className="text-[10px] text-slate-300">or press <kbd className="bg-slate-100 text-slate-500 px-1 py-0.5 rounded text-[9px] font-mono">Ctrl+V</kbd> to paste</p>
                    <p className="text-[10px] text-slate-300">Images · PDF · Word · Excel · Video · Audio · Archives</p>
                  </div>
                ) : (
                  <div className="p-3">
                    {/* Image grid */}
                    {(() => {
                      const imageFiles    = files.filter(f => isImageFile(f));
                      const nonImageFiles = files.filter(f => !isImageFile(f));
                      return (
                        <div className="space-y-2" onClick={e => e.stopPropagation()}>
                          {imageFiles.length > 0 && (
                            <div className={`grid gap-1.5 ${imageFiles.length === 1 ? "grid-cols-1" : imageFiles.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                              {imageFiles.map((f, i) => {
                                const key     = f.name + f.size;
                                const src     = previews[key];
                                const origIdx = files.indexOf(f);
                                return (
                                  <div key={key} className="relative group rounded-xl overflow-hidden" style={{ aspectRatio: "1/1" }}>
                                    <img src={src} alt={f.name} className="w-full h-full object-cover group-hover:brightness-90 transition-all cursor-pointer" onClick={() => setLightbox(src)} />
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 bg-black/20">
                                      <button onClick={() => setLightbox(src)} className="p-1.5 bg-black/60 rounded-full"><ZoomIn size={13} className="text-white" /></button>
                                    </div>
                                    <button onClick={() => removeFile(origIdx)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={10}/></button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {nonImageFiles.map(f => {
                            const { Icon, color, bg } = getFileIcon(f.name);
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
                      );
                    })()}
                  </div>
                )}
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => { addFiles(Array.from(e.target.files)); e.target.value = ""; }} />
              </div>

              {fileError && <p className="text-[11px] text-red-500 font-bold px-1">{fileError}</p>}
              {files.length > 0 && (
                <p className="text-[10px] text-slate-400 font-medium px-1">{files.length} file{files.length > 1 ? "s" : ""} selected · {(files.reduce((s, f) => s + f.size, 0) / 1024).toFixed(0)} KB total</p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="p-5 pt-0 flex gap-3 flex-shrink-0">
            <button onClick={onClose} disabled={loading} className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-2xl font-black text-[12px] hover:bg-slate-300 transition-all disabled:opacity-50">Cancel</button>
            <button onClick={handleConfirm} disabled={loading} className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-black text-[12px] hover:bg-red-600 shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Spinner size={14}/> Closing…</> : "🔒 Close Ticket"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
