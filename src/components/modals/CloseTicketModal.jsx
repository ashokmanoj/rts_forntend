import { useState } from "react";
import { X, Upload, Paperclip } from "lucide-react";
import { useEscapeKey } from "../../hooks/useEscapeKey";

/**
 * Popup for closing a ticket — resolution note + optional file upload.
 * ESC key cancels.
 */
export default function CloseTicketModal({ req, onClose, onConfirmClose }) {
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  useEscapeKey(onClose);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setFilePreview(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
  };

  const handleConfirm = () => {
    onConfirmClose(req.id, note, file);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md border border-slate-200">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-black uppercase tracking-tighter text-slate-800">
            Close Ticket — #{req?.id}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Resolution note */}
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              Resolution Note
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border-2 border-slate-100 p-3 rounded-xl h-28 outline-none focus:border-indigo-400 bg-slate-50 transition-all font-medium text-[12px] resize-none"
              placeholder="Describe how the ticket was resolved..."
            />
          </div>

          {/* File upload */}
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              Attach File (Optional)
            </p>
            <div
              className="relative border-2 border-dashed border-slate-200 min-h-[120px] flex flex-col items-center justify-center rounded-2xl bg-slate-50 hover:bg-blue-50 transition-colors cursor-pointer"
              onClick={() => document.getElementById("closeTicketFile").click()}
            >
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="preview"
                  className="max-h-24 rounded-lg shadow object-contain"
                />
              ) : file ? (
                <div className="flex flex-col items-center gap-1">
                  <Paperclip size={24} className="text-indigo-400" />
                  <span className="text-[11px] text-slate-600 font-bold">
                    {file.name}
                  </span>
                </div>
              ) : (
                <>
                  <Upload className="text-slate-300 mb-1" size={28} />
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                    Click to upload file
                  </span>
                </>
              )}
              <input
                type="file"
                id="closeTicketFile"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {file && (
              <button
                onClick={() => {
                  setFile(null);
                  setFilePreview(null);
                }}
                className="text-xs text-red-500 font-bold mt-1 hover:underline"
              >
                Remove file
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-2xl font-black text-[12px] hover:bg-slate-300 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-black text-[12px] hover:bg-red-600 shadow-md transition-all"
            >
              Close Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
