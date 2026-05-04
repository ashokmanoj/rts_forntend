import { BookOpen, X, Download } from "lucide-react";
import { useEscapeKey } from "../../hooks/useEscapeKey";

export default function InstructionsModal({
  onClose,
  pdfSrc      = "/RTS-User-Guide.pdf",
  downloadName = "RTS-User-Guide.pdf",
  title        = "RTS User Guide",
  subtitle     = "Manual & Instructions",
}) {
  useEscapeKey(onClose);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col w-full max-w-5xl" style={{ height: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-slate-800 to-slate-900 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <BookOpen size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-tight">{title}</h2>
              <p className="text-slate-400 text-[10px] font-medium">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={pdfSrc}
              download={downloadName}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-black transition-all active:scale-95"
            >
              <Download size={12} /> Download PDF
            </a>
            <button
              onClick={onClose}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* PDF embed */}
        <div className="flex-1 overflow-hidden rounded-b-2xl">
          <iframe
            src={pdfSrc}
            title={title}
            className="w-full h-full border-none"
          />
        </div>

      </div>
    </div>
  );
}
