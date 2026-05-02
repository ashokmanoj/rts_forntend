import { useState } from "react";
import {
  Paperclip, FileText, FileSpreadsheet, FileImage,
  Film, Music, Archive, File, ZoomIn, X, Download,
} from "lucide-react";
import VoiceMessageBubble from "./VoiceMessageBubble";
import { getAvatarClass, getInitials } from "../../utils/roleStyles";
import { sanitizeUrl } from "../../utils/security";

function getFileIcon(fileName = "") {
  const n = fileName.toLowerCase();
  if (/\.(png|jpg|jpeg|gif|webp|svg|bmp)$/.test(n))
    return { Icon: FileImage,      color: "text-purple-500", bg: "bg-purple-50" };
  if (n.endsWith(".pdf"))
    return { Icon: FileText,       color: "text-red-500",    bg: "bg-red-50"    };
  if (/\.(doc|docx)$/.test(n))
    return { Icon: FileText,       color: "text-blue-600",   bg: "bg-blue-50"   };
  if (/\.(xls|xlsx|csv)$/.test(n))
    return { Icon: FileSpreadsheet,color: "text-green-600",  bg: "bg-green-50"  };
  if (/\.(mp4|mov|avi|mkv|webm)$/.test(n))
    return { Icon: Film,           color: "text-pink-500",   bg: "bg-pink-50"   };
  if (/\.(mp3|wav|m4a|ogg)$/.test(n))
    return { Icon: Music,          color: "text-yellow-500", bg: "bg-yellow-50" };
  if (/\.(zip|rar|7z|tar|gz)$/.test(n))
    return { Icon: Archive,        color: "text-orange-500", bg: "bg-orange-50" };
  return   { Icon: File,           color: "text-slate-500",  bg: "bg-slate-50"  };
}

// ── Lightbox ──────────────────────────────────────────────────────
function Lightbox({ src, fileName, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center gap-3 max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between w-full px-1">
          <span className="text-white text-sm font-bold truncate max-w-[80%]">
            {fileName || "Image"}
          </span>
          <div className="flex items-center gap-2">
            <a
              href={sanitizeUrl(src)}
              download={fileName}
              onClick={(e) => e.stopPropagation()}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              title="Download"
            >
              <Download size={16} />
            </a>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-red-500 rounded-full text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Full image */}
        <img
          src={sanitizeUrl(src)}
          alt={fileName}
          className="max-h-[82vh] max-w-full rounded-xl object-contain shadow-2xl"
        />
        <p className="text-white/40 text-[11px]">Click outside or press ESC to close</p>
      </div>
    </div>
  );
}

// ── MessageBubble ─────────────────────────────────────────────────
export default function MessageBubble({ log }) {
  const [lightbox, setLightbox] = useState(false);

  const hasFile  = log.type === "file"  || log.type === "mixed";
  const hasVoice = log.type === "voice" || log.type === "mixed";
  const hasText  = !!log.text;

  const { Icon, color, bg } = hasFile ? getFileIcon(log.fileName || "") : {};

  return (
    <>
      {lightbox && (
        <Lightbox
          src={log.fileUrl}
          fileName={log.fileName}
          onClose={() => setLightbox(false)}
        />
      )}

      <div className="flex gap-2 items-start">
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5 ${getAvatarClass(log.role)}`}>
          {getInitials(log.author)}
        </div>

        <div className="flex-1">
          {/* Header: name + timestamp */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-bold text-slate-800 text-[12px]">{log.author}</span>
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
              log.role === "RM"      ? "bg-blue-100 text-blue-600" :
              log.role === "HOD"     ? "bg-purple-100 text-purple-600" :
              log.role === "DeptHOD" ? "bg-teal-100 text-teal-600" :
              log.role === "Admin"   ? "bg-orange-100 text-orange-600" :
              "bg-slate-100 text-slate-500"
            }`}>
              {log.role}
            </span>
            <span className="text-[9px] text-slate-400 ml-auto">{log.date} · {log.time}</span>
          </div>

          {/* Bubble content */}
          <div className="flex flex-col gap-1.5 bg-white border border-slate-100 rounded-2xl px-3 py-2.5 shadow-sm w-fit max-w-full">

            {/* ── Image file — clickable thumbnail ── */}
            {hasFile && log.isImage && (
              <div
                className="relative group cursor-pointer"
                onClick={() => setLightbox(true)}
              >
                <img
                  src={sanitizeUrl(log.fileUrl)}
                  alt={log.fileName}
                  className="max-w-[220px] max-h-[170px] rounded-xl object-cover border border-slate-100 group-hover:brightness-90 transition-all"
                />
                {/* Hover zoom overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                  <div className="bg-black/50 rounded-full p-2">
                    <ZoomIn size={18} className="text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* ── Non-image file — download link ── */}
            {hasFile && !log.isImage && (
              <a
                href={sanitizeUrl(log.fileUrl)}
                download={log.fileName}
                className={`flex items-center gap-2 ${bg} rounded-xl px-3 py-2 text-[11px] font-bold hover:brightness-95 transition-all`}
              >
                <Icon size={14} className={color} />
                <span className="truncate text-slate-700 max-w-[180px]">{log.fileName}</span>
                <Paperclip size={11} className="text-slate-400 flex-shrink-0" />
              </a>
            )}

            {/* ── Voice ── */}
            {hasVoice && (
              <VoiceMessageBubble src={sanitizeUrl(log.voiceUrl)} duration={log.duration} />
            )}

            {/* ── Text / caption ── */}
            {hasText && (
              <p className="text-slate-600 text-[11px] leading-relaxed break-words">{log.text}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
