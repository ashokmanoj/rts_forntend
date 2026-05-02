import { useState } from "react";
import {
  X,
  Upload,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  FileImage,
  Film,
  Music,
  Archive,
  File,
} from "lucide-react";
import { useEscapeKey } from "../../hooks/useEscapeKey";

const DEPARTMENTS = [
  "Academic",
  "Accounts",
  "Admin",
  "Animation",
  "Broadcasting",
  "Business Development",
  "Corporate Communications",
  "Documentation",
  "Food Committee",
  "Govt. Relations",
  "HR",
  "Management",
  "Marketing",
  "Operation",
  "Purchase",
  "RTS Help Desk",
  "Software",
  "Store",
  "System admin",
  "TA Committee",
  "Technical Support"
];

/** Returns display info based on the file's MIME type */
function getFileInfo(file) {
  const t = file.type;
  if (t.startsWith("image/"))
    return {
      kind: "image",
      label: "Image",
      color: "bg-purple-100",
      iconColor: "text-purple-500",
    };
  if (t.startsWith("video/"))
    return {
      kind: "video",
      label: "Video",
      color: "bg-pink-100",
      iconColor: "text-pink-500",
    };
  if (t.startsWith("audio/"))
    return {
      kind: "audio",
      label: "Audio",
      color: "bg-yellow-100",
      iconColor: "text-yellow-500",
    };
  if (t === "application/pdf")
    return {
      kind: "pdf",
      label: "PDF",
      color: "bg-red-100",
      iconColor: "text-red-500",
    };
  if (t.includes("word"))
    return {
      kind: "word",
      label: "Word Doc",
      color: "bg-blue-100",
      iconColor: "text-blue-600",
    };
  if (t.includes("excel") || t.includes("spreadsheet"))
    return {
      kind: "excel",
      label: "Spreadsheet",
      color: "bg-green-100",
      iconColor: "text-green-600",
    };
  if (
    t.includes("zip") ||
    t.includes("rar") ||
    t.includes("tar") ||
    t.includes("7z")
  )
    return {
      kind: "archive",
      label: "Archive",
      color: "bg-orange-100",
      iconColor: "text-orange-500",
    };
  return {
    kind: "other",
    label: "File",
    color: "bg-slate-100",
    iconColor: "text-slate-500",
  };
}

/** Renders the right icon for the file kind */
function FileKindIcon({ kind, iconColor, size = 32 }) {
  const cls = iconColor;
  if (kind === "image") return <FileImage size={size} className={cls} />;
  if (kind === "video") return <Film size={size} className={cls} />;
  if (kind === "audio") return <Music size={size} className={cls} />;
  if (kind === "pdf") return <FileText size={size} className={cls} />;
  if (kind === "word") return <FileText size={size} className={cls} />;
  if (kind === "excel") return <FileSpreadsheet size={size} className={cls} />;
  if (kind === "archive") return <Archive size={size} className={cls} />;
  return <File size={size} className={cls} />;
}

/** Formats bytes into a readable string e.g. "1.2 MB" */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Popup for submitting a new request.
 * Accepts ANY file type — images show an inline preview,
 * all other types show a styled icon card with file name and size.
 * onSubmit receives { purpose, dept, description, file }
 */
export default function AddRequestModal({ onClose, onSubmit, currentUser }) {
  const [purpose, setPurpose] = useState("");
  const [assignedDept, setAssignedDept] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEscapeKey(onClose);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setUploadedFile(f);
    setImagePreview(
      f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
    );
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setImagePreview(null);
  };

  const handleSubmit = () => {
    if (!purpose.trim()) return;
    onSubmit({ purpose, assignedDept, description, file: uploadedFile });
    onClose();
  };

  const fileInfo = uploadedFile ? getFileInfo(uploadedFile) : null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-800">
            Add Request
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-4">
          {/* Title */}
          <input
            className="w-full bg-slate-100 p-5 rounded-2xl text-center border-none focus:ring-2 focus:ring-indigo-500 font-[600] outline-none text-[17px]"
            placeholder="Enter title for your request purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />

          {/* Your Department (read-only info) */}
          {currentUser?.dept && (
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-3">
              <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Your Department</span>
              <span className="text-[17px] font-black text-indigo-700 ml-auto">{currentUser.dept}</span>
            </div>
          )}

          {/* Assign To Department */}
          <div className="relative">
            <select
              className="w-full appearance-none bg-slate-100 p-5 rounded-2xl text-center border-none font-medium cursor-pointer outline-none text-[14px]"
              value={assignedDept}
              onChange={(e) => setAssignedDept(e.target.value)}
            >
              <option value="">Assign To Department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d} Department
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-5 top-6 text-slate-400 pointer-events-none"
              size={18}
            />
          </div>

          {/* Description */}
          <textarea
            className="w-full bg-slate-100 p-6 rounded-2xl text-center border-none h-32 focus:ring-2 focus:ring-indigo-500 resize-none font-medium outline-none text-[15px]"
            placeholder="Input your request in detail here"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* ── Upload zone ── */}
          <div className="relative border-4 border-dashed border-slate-100 min-h-[180px] flex flex-col items-center justify-center rounded-3xl bg-slate-50 hover:bg-blue-50/40 transition-colors group overflow-hidden">
            {/* Empty state */}
            {!uploadedFile && (
              <>
                <Upload
                  className="text-slate-300 mb-2 group-hover:text-blue-400 transition-colors"
                  size={34}
                />
                <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  Upload any file
                </span>
                <span className="text-slate-700 text-[9px] mt-1 font-medium">
                  Images · PDF · Word · Excel · Video · Audio · Zip · and more
                </span>
                <button
                  onClick={() =>
                    document.getElementById("addReqFileInput").click()
                  }
                  className="mt-4 bg-indigo-900 text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg active:scale-95 transition-transform"
                >
                  Select file
                </button>
              </>
            )}

            {/* Image preview */}
            {uploadedFile && fileInfo.kind === "image" && imagePreview && (
              <div className="flex flex-col items-center gap-2 p-4 w-full">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-28 rounded-xl shadow-md object-contain"
                />
                <p className="text-[11px] text-slate-500 font-medium truncate max-w-[240px]">
                  {uploadedFile.name}
                </p>
                <p className="text-[10px] text-slate-400">
                  {formatSize(uploadedFile.size)}
                </p>
              </div>
            )}

            {/* Non-image file icon card */}
            {uploadedFile && fileInfo.kind !== "image" && (
              <div className="flex flex-col items-center gap-3 p-5">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${fileInfo.color}`}
                >
                  <FileKindIcon
                    kind={fileInfo.kind}
                    iconColor={fileInfo.iconColor}
                    size={32}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-black text-slate-700 truncate max-w-[240px]">
                    {uploadedFile.name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {fileInfo.label} · {formatSize(uploadedFile.size)}
                  </p>
                </div>
              </div>
            )}

            {/* Change / Remove links shown after a file is selected */}
            {uploadedFile && (
              <div className="flex items-center gap-4 mt-1">
                <button
                  onClick={() =>
                    document.getElementById("addReqFileInput").click()
                  }
                  className="text-[11px] text-indigo-600 font-bold hover:underline"
                >
                  Change
                </button>
                <span className="text-slate-300 text-xs">|</span>
                <button
                  onClick={handleRemove}
                  className="text-[11px] text-red-500 font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Hidden file input — accepts everything */}
            <input
              type="file"
              id="addReqFileInput"
              className="hidden"
              accept="*"
              onChange={handleFileChange}
            />
          </div>

          {/* Action buttons */}
          <div className="flex space-x-4 mt-8">
            <button
              onClick={onClose}
              className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-black text-lg hover:bg-red-600 shadow-lg"
            >
              Close
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-[#10b981] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#059669] shadow-lg"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
