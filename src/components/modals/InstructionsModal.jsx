import { BookOpen, X } from "lucide-react";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { INSTRUCTION_SECTIONS } from "../../constants/instructions";

/** Full user-guide popup. ESC closes it. */
export default function InstructionsModal({ onClose }) {
  useEscapeKey(onClose);

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl border border-slate-200 flex flex-col"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-t-[2rem] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">
                How to Use RTS System
              </h2>
              <p className="text-indigo-200 text-[10px] font-medium">
                Request Tracking System — User Guide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto p-5 space-y-3 flex-1">
          {INSTRUCTION_SECTIONS.map((sec) => (
            <div
              key={sec.title}
              className={`rounded-2xl border p-4 ${sec.color}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{sec.icon}</span>
                <h3
                  className={`font-black text-[13px] uppercase tracking-wide ${sec.titleColor}`}
                >
                  {sec.title}
                </h3>
              </div>
              <ol className="space-y-1.5 pl-1">
                {sec.steps.map((step, j) => (
                  <li
                    key={j}
                    className="flex gap-2 text-[11px] text-slate-700 leading-relaxed"
                  >
                    {step.startsWith("→") ? (
                      <span className="pl-4 text-slate-600">{step}</span>
                    ) : (
                      <>
                        <span
                          className={`flex-shrink-0 font-black text-[10px] w-4 pt-0.5 ${sec.titleColor}`}
                        >
                          {j + 1}.
                        </span>
                        <span>{step}</span>
                      </>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-slate-50/50 rounded-b-[2rem] flex-shrink-0 flex justify-between items-center">
          <p className="text-[10px] text-slate-400 font-medium">
            RTS — Tele Education · Internal Use Only
          </p>
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-black text-[12px] transition-all shadow-md"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
