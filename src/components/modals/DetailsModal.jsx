import { useState } from "react";
import {
  X, User, ChevronDown, CheckCircle, XCircle, Clock, Forward,
  ImageOff, ZoomIn, ChevronLeft, ChevronRight, Download,
} from "lucide-react";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { getNowTime, getNowDate, getNowDateTime } from "../../utils/dateTime";
import StatusBadge from "../table/StatusBadge";
import ChatPanel from "../chat/ChatPanel";

const DEPARTMENTS = [
  "IT","HR","Admin","Finance","Operations","Procurement",
  "Accounts","Animation","Software","Technical Support",
  "Broadcasting","Academic","Store","Management",
];

// ── Image Lightbox ────────────────────────────────────────────────
function ImageLightbox({ src, fileName, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/90 z-[200] flex flex-col items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl max-h-[90vh] flex flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between w-full px-2">
          <span className="text-white text-sm font-bold truncate max-w-[80%]">
            {fileName || "Image"}
          </span>
          <div className="flex items-center gap-2">
            <a
              href={src}
              download={fileName}
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

        {/* Image */}
        <img
          src={src}
          alt={fileName}
          className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
        />
      </div>
    </div>
  );
}

// ── Step progress indicator ───────────────────────────────────────
function ApprovalProgress({ rmStatus, hodStatus, deptHodStatus, isClosed }) {
  const steps = [
    { label: "RM Review",     status: rmStatus,      role: "RM" },
    { label: "HOD Review",    status: hodStatus,      role: "HOD" },
    { label: "Dept HOD",      status: deptHodStatus,  role: "DeptHOD" },
  ];

  const getColor = (status) => {
    if (status === "Approved")  return "bg-emerald-500 border-emerald-500 text-white";
    if (status === "Rejected")  return "bg-red-500 border-red-500 text-white";
    if (status === "Checking")  return "bg-amber-400 border-amber-400 text-white";
    if (status === "Forwarded") return "bg-blue-500 border-blue-500 text-white";
    return "bg-slate-100 border-slate-200 text-slate-400";
  };

  const getLineColor = (status) => {
    if (!status || status === "--") return "bg-slate-200";
    if (status === "Approved")  return "bg-emerald-400";
    if (status === "Rejected")  return "bg-red-400";
    return "bg-amber-300";
  };

  return (
    <div className="space-y-1">
      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
        Approval Progress
      </p>
      <div className="flex items-center gap-0">
        {steps.map((step, i) => (
          <div key={step.role} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1 min-w-0">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all ${getColor(step.status)}`}>
                {step.status === "Approved" ? <CheckCircle size={14} /> :
                 step.status === "Rejected" ? <XCircle size={14} /> :
                 step.status === "Checking" ? <Clock size={14} /> :
                 step.status === "Forwarded" ? <Forward size={12} /> :
                 <span>{i + 1}</span>}
              </div>
              <span className="text-[8px] text-slate-500 font-bold mt-0.5 text-center leading-tight px-1 truncate w-full text-center">
                {step.label}
              </span>
              {step.status && step.status !== "--" && (
                <span className={`text-[7px] font-black ${
                  step.status === "Approved" ? "text-emerald-600" :
                  step.status === "Rejected" ? "text-red-500" :
                  step.status === "Checking" ? "text-amber-600" :
                  "text-blue-500"
                }`}>
                  {step.status}
                </span>
              )}
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-4 flex-shrink-0 mx-0.5 ${getLineColor(step.status)}`} />
            )}
          </div>
        ))}
        {/* Closed indicator */}
        <div className="flex items-center flex-shrink-0">
          <div className={`h-0.5 w-4 ${isClosed ? "bg-emerald-400" : "bg-slate-200"}`} />
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black ${isClosed ? "bg-emerald-500 border-emerald-500 text-white" : "bg-slate-100 border-slate-200 text-slate-300"}`}>
              {isClosed ? "✓" : "🔒"}
            </div>
            <span className="text-[8px] text-slate-500 font-bold mt-0.5">Closed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function DetailsModal({
  req,
  chatLogs,
  currentUser,
  onClose,
  onSendMessage,
  onApproval,
  onOpenCloseTicket,
}) {
  const [selectedDept, setSelectedDept] = useState(req?.assignedDept || "IT");
  const [approvalComment, setApprovalComment] = useState("");
  const [lightboxSrc, setLightboxSrc] = useState(null);

  useEscapeKey(lightboxSrc ? () => setLightboxSrc(null) : onClose);

  const logs = chatLogs[req?.id] || [];
  const deptChanged = selectedDept !== req?.assignedDept;

  const role     = (currentUser?.role || "");
  const roleLow  = role.toLowerCase();
  const isClosed = req?.isClosed || false;

  // ── Permission flags ──────────────────────────────────────────
  // RM: step 1 approval only — no close ticket
  const isRM      = roleLow === "rm";
  // HOD: step 2 approval only — no close ticket
  const isHOD     = roleLow === "hod";
  // DeptHOD: step 3 approval + close ticket
  const isDeptHOD = roleLow === "depthod";
  // Admin: read-only — no actions, no chat input
  const isAdmin   = roleLow === "admin";
  // Employee/requestor: chat only — no actions
  const isEmployee = roleLow === "employee";

  const canApprove    = isRM || isHOD || isDeptHOD;
  const canCloseTicket = isDeptHOD && !isClosed;
  const canChangeDept = isRM || isHOD || isDeptHOD;
  const canChat       = !isAdmin && !isClosed;

  const isImageFile = (url) =>
    url && /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url);

  // ── Approval handler ──────────────────────────────────────────
  const handleApproval = (decision) => {
    const dateTime = getNowDateTime();
    const time     = getNowTime();
    const date     = getNowDate();

    onApproval(req.id, decision, dateTime, currentUser, approvalComment, selectedDept);

    // Optimistic approval card in chat
    onSendMessage(req.id, {
      id: Date.now(),
      author: currentUser.name,
      role: currentUser.role,
      text: approvalComment || `${decision} the request.`,
      time, date,
      type: "approval",
      status: decision,
      purpose: req.purpose,
      changedDept: decision === "Forwarded" ? selectedDept : null,
      originalDept: req.assignedDept,
    });
    setApprovalComment("");
  };

  // ── Action button label based on role ─────────────────────────
  const actionLabel = isRM ? "RM Action" : isHOD ? "HOD Action" : "Dept HOD Action";

  return (
    <>
      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          fileName={req?.fileName}
          onClose={() => setLightboxSrc(null)}
        />
      )}

      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div
          className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 flex flex-col"
          style={{ maxHeight: "100vh" }}
        >
          {/* ── Header ── */}
          <div className="p-4 border-b flex justify-between items-center bg-slate-50/50 flex-shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black uppercase tracking-tighter text-slate-800">
                #{req?.id} — {req?.purpose}
              </h2>
              {req?.forwarded && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black">
                  <Forward size={10} /> Forwarded
                </span>
              )}
              {isClosed && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-black">
                  🔒 Closed
                </span>
              )}
              {/* Role badge */}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                isRM      ? "bg-blue-100 text-blue-700" :
                isHOD     ? "bg-purple-100 text-purple-700" :
                isDeptHOD ? "bg-teal-100 text-teal-700" :
                isAdmin   ? "bg-orange-100 text-orange-700" :
                "bg-indigo-100 text-indigo-700"
              }`}>
                {role}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="flex flex-1 overflow-hidden">
            {/* ════ LEFT ════ */}
            <div className="w-[48%] border-r border-slate-200 overflow-y-auto p-5 space-y-3">

              {/* 3-step progress bar */}
              <ApprovalProgress
                rmStatus={req?.rmStatus}
                hodStatus={req?.hodStatus}
                deptHodStatus={req?.deptHodStatus}
                isClosed={isClosed}
              />

              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1 pt-1">
                <User size={11} /> User Information
              </p>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Date",        value: req?.date },
                  { label: "User ID",     value: req?.empId },
                  { label: "Name",        value: req?.name },
                  { label: "Department",  value: req?.dept },
                  { label: "Designation", value: req?.designation },
                  { label: "Location",    value: req?.location },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                      {item.label}
                    </p>
                    <p className="font-bold text-slate-800 text-[12px]">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Request title */}
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 ml-0.5">
                  Request Title
                </p>
                <div className="w-full bg-slate-200 p-3 rounded-xl text-center font-bold text-slate-500 text-[12px] border border-slate-300 cursor-not-allowed select-none flex items-center justify-center gap-2">
                  <span className="text-slate-400 text-[11px]">🔒</span>
                  {req?.purpose}
                </div>
              </div>

              {/* Assigned Department */}
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 ml-0.5">
                  Assigned Department
                  {deptChanged && canChangeDept && (
                    <span className="ml-1 text-blue-600 normal-case font-bold text-[9px]">
                      (<span className="line-through text-slate-400">{req?.assignedDept}</span> → <b>{selectedDept}</b>)
                    </span>
                  )}
                </p>
                <div className="relative">
                  <select
                    className={`w-full appearance-none p-3 rounded-xl text-center font-bold border-none focus:ring-2 transition-all text-sm ${
                      deptChanged && canChangeDept
                        ? "bg-blue-50 text-blue-700 ring-2 ring-blue-300 cursor-pointer"
                        : canChangeDept
                          ? "bg-slate-100 text-slate-700 focus:ring-indigo-500 cursor-pointer"
                          : "bg-slate-100 text-slate-500 cursor-not-allowed"
                    }`}
                    value={selectedDept}
                    onChange={(e) => canChangeDept && setSelectedDept(e.target.value)}
                    disabled={!canChangeDept}
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d} Department</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 ml-0.5">
                  Request Description
                </p>
                <div className="w-full bg-slate-50 p-3 rounded-xl text-slate-600 border border-slate-200 leading-relaxed text-[12px]">
                  {req?.description || "No description provided."}
                </div>
              </div>

              {/* Attached image / file */}
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 ml-0.5">
                  Attached File
                </p>
                <div className="border-2 border-dashed border-blue-100 p-3 flex justify-center items-center rounded-xl bg-blue-50/30 min-h-[90px]">
                  {req?.fileUrl ? (
                    isImageFile(req.fileUrl) ? (
                      <div className="relative group cursor-pointer" onClick={() => setLightboxSrc(req.fileUrl)}>
                        <img
                          src={req.fileUrl}
                          alt={req.fileName || "attachment"}
                          className="rounded-lg shadow-md border-4 border-white max-h-48 object-contain group-hover:brightness-90 transition-all"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-black/50 rounded-full p-2">
                            <ZoomIn size={20} className="text-white" />
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 text-center mt-1 font-medium">
                          Click to view full size
                        </p>
                      </div>
                    ) : (
                      <a
                        href={req.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold text-[12px] underline"
                      >
                        📎 {req.fileName || "View attachment"}
                      </a>
                    )
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-300">
                      <ImageOff size={28} />
                      <span className="text-[10px] font-bold text-slate-400">No attachment</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Approval section — RM / HOD / DeptHOD only ── */}
              {canApprove && !isAdmin && (
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
                    {actionLabel}
                  </p>

                  {/* Status cards */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 rounded-xl p-2 border border-slate-100 text-center">
                      <p className="text-[8px] text-slate-600 font-bold uppercase mb-1">RM</p>
                      <StatusBadge status={req?.rmStatus} date={req?.rmDate} />
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2 border border-slate-100 text-center">
                      <p className="text-[8px] text-slate-600 font-bold uppercase mb-1">HOD</p>
                      <StatusBadge status={req?.hodStatus} date={req?.hodDate} />
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2 border border-slate-100 text-center">
                      <p className="text-[8px] text-slate-600 font-bold uppercase mb-1">Dept HOD</p>
                      <StatusBadge status={req?.deptHodStatus} date={req?.deptHodDate} />
                    </div>
                  </div>

                  <textarea
                    value={approvalComment}
                    onChange={(e) => setApprovalComment(e.target.value)}
                    className="w-full border-2 border-slate-100 p-3 rounded-xl h-16 outline-none focus:border-indigo-400 bg-slate-50 transition-all font-medium text-[12px] resize-none"
                    placeholder="Add your official comments here..."
                  />

                  <div className="grid grid-cols-3 gap-2">
                    {deptChanged ? (
                      <button
                        onClick={() => handleApproval("Forwarded")}
                        className="bg-blue-500 text-white py-2.5 rounded-xl font-black text-[11px] hover:bg-blue-600 shadow-md uppercase transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Forward size={13} /> Forward
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApproval("Approved")}
                        className="bg-emerald-500 text-white py-2.5 rounded-xl font-black text-[11px] hover:bg-emerald-600 shadow-md uppercase transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle size={13} /> Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleApproval("Checking")}
                      className="bg-amber-500 text-white py-2.5 rounded-xl font-black text-[11px] hover:bg-amber-600 shadow-md uppercase transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Clock size={13} /> Checking
                    </button>
                    <button
                      onClick={() => handleApproval("Rejected")}
                      className="bg-red-500 text-white py-2.5 rounded-xl font-black text-[11px] hover:bg-red-600 shadow-md uppercase transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Admin read-only notice */}
              {isAdmin && (
                <div className="border border-orange-200 bg-orange-50 rounded-xl p-3 text-center">
                  <p className="text-orange-600 font-black text-[11px] uppercase tracking-wider">
                    👁 Admin — Read Only Access
                  </p>
                  <p className="text-orange-500 text-[10px] mt-0.5">
                    You can view all details but cannot take any actions.
                  </p>
                </div>
              )}

              {/* Close Ticket — DeptHOD only */}
              {isDeptHOD && (
                <button
                  onClick={() => !isClosed && onOpenCloseTicket(req)}
                  disabled={isClosed}
                  className={`w-full py-2.5 rounded-2xl font-black text-[12px] transition-all shadow-md ${
                    isClosed
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                >
                  {isClosed ? "🔒 Ticket Closed" : "Close Ticket"}
                </button>
              )}
            </div>

            {/* ════ RIGHT: Chat ════ */}
            <ChatPanel
              reqId={req?.id}
              logs={logs}
              currentUser={currentUser}
              onSendMessage={onSendMessage}
              isClosed={isClosed}
              canChat={canChat}
            />
          </div>
        </div>
      </div>
    </>
  );
}