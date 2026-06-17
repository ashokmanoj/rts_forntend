import { useState, useEffect, useCallback, useRef } from "react";
import { LogOut, Zap, ClipboardList, ShieldCheck, ShieldOff, Users, UtensilsCrossed, BarChart2, RefreshCw, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, Pencil, Trash2, AlertTriangle, UserPlus, KeyRound, Search, X, Plus, MessageSquare } from "lucide-react";

import { fetchRequests, fetchFilterOptions, createRequest, submitApproval, acknowledgeRequest, markRequestSeen, markRequestUnread, closeRequest, editRequest, deleteRequest } from "../services/requestService";
import { fetchUserRoles, addUserRole, updateUserRole, toggleUserRole, deleteUserRole } from "../services/userRoleService";
import { fetchHodPendingRequests, submitHodApproval } from "../services/managementService";
import { fetchChat, sendText, sendFile, sendVoice } from "../services/chatService";
import { adminGetFoodSubscriptions, adminSubscribeUser, adminToggleFoodUser, adminDeleteFoodUser } from "../services/foodService";

import SearchableSelect   from "../components/ui/SearchableSelect";
import FilterBar          from "../components/layout/FilterBar";
import RequestTable       from "../components/table/RequestTable";
import DetailsModal       from "../components/modals/DetailsModal";
import AddRequestModal    from "../components/modals/AddRequestModal";
import CloseTicketModal   from "../components/modals/CloseTicketModal";
import UserManagementPage from "./UserManagementPage";
import FoodPage           from "./FoodPage";
import AdminReportPage    from "./AdminReportPage";

const DEPARTMENTS = ["Academics-Assam","Academics-Karnataka","Academics-Mizoram","Academics-Tripura","Academics-Uttarakhand","Accounts-A","Accounts-G","Animation","Broadcasting-Assam","Broadcasting-Karnataka","Broadcasting-Mizoram","Broadcasting-Tripura","Broadcasting-Uttarakhand","Business Development","Corporate Communications","Documentation","Facilities","Food Committee","Game Development","Govt. Relations","HR","Management","Marketing","Operations-Assam","Operations-Bihar","Operations-Karnataka","Operations-Maharashtra","Operations-Mizoram","Operations-Nagaland","Operations-Tripura","Operations-Uttarakhand","Purchase","RTS Help Desk","Software","Stores-Assam","Stores-Karnataka","Stores-Mizoram","Stores-Tripura","System Admin-Assam","System Admin-Karnataka","System Admin-Uttarakhand","TA Committee","Technical Support"];

// ─────────────────────────────────────────────────────────────────────────────
// Edit Request Modal
// ─────────────────────────────────────────────────────────────────────────────
function EditRequestModal({ req, onClose, onSave }) {
  const [form, setForm] = useState({
    purpose:          req.purpose        || "",
    description:      req.description    || "",
    assignedDept:     req.assignedDept   || "",
    dueDate:          req.dueDate        ? req.dueDate.slice(0, 10) : "",
    assignedPersonEmpId: req.assignedPersonEmpId || "",
    assignedPersonName:  req.assignedPersonName  || "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.purpose.trim()) { setError("Purpose is required."); return; }
    setSaving(true); setError("");
    try {
      await onSave(req.id, {
        purpose:          form.purpose.trim(),
        description:      form.description.trim(),
        assignedDept:     form.assignedDept,
        dueDate:          form.dueDate || null,
        assignedPersonEmpId: form.assignedPersonEmpId.trim() || null,
        assignedPersonName:  form.assignedPersonName.trim()  || null,
      });
      onClose();
    } catch (e) { setError(e.message || "Failed to save."); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-black text-sm">Edit Request #{req.id}</h2>
            <p className="text-indigo-200 text-[11px]">SuperUser edit — changes are logged in chat</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><XCircle size={20} /></button>
        </div>

        <div className="px-6 py-5 space-y-3">
          {error && <p className="text-red-600 text-[11px] font-bold bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase">Purpose *</label>
            <input value={form.purpose} onChange={e => set("purpose", e.target.value)}
              className="w-full mt-1 px-3 py-2 text-[12px] border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase">Description</label>
            <textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)}
              className="w-full mt-1 px-3 py-2 text-[12px] border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase">Assigned Dept</label>
              <SearchableSelect
                value={form.assignedDept}
                onChange={(val) => set("assignedDept", val)}
                options={DEPARTMENTS}
                placeholder="Select dept…"
                className="mt-1"
                triggerClassName="px-3 py-2 text-[12px] bg-white border border-slate-200 rounded-xl font-bold hover:border-indigo-300"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)}
                className="w-full mt-1 px-3 py-2 text-[12px] border border-slate-200 rounded-xl outline-none focus:border-indigo-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase">Assigned Person EmpID</label>
              <input value={form.assignedPersonEmpId} onChange={e => set("assignedPersonEmpId", e.target.value)}
                className="w-full mt-1 px-3 py-2 text-[12px] border border-slate-200 rounded-xl outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase">Assigned Person Name</label>
              <input value={form.assignedPersonName} onChange={e => set("assignedPersonName", e.target.value)}
                className="w-full mt-1 px-3 py-2 text-[12px] border border-slate-200 rounded-xl outline-none focus:border-indigo-400" />
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose} disabled={saving}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-[12px] hover:bg-slate-50 transition-all disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[12px] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete Confirm Modal
// ─────────────────────────────────────────────────────────────────────────────
function DeleteConfirmModal({ req, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState("");

  const handleDelete = async () => {
    setDeleting(true); setError("");
    try { await onConfirm(req.id); onClose(); }
    catch (e) { setError(e.message || "Failed to delete."); setDeleting(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
        <div className="px-6 py-5 text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle size={28} className="text-red-600" />
          </div>
          <h2 className="text-slate-800 font-black text-sm mb-1">Delete Request #{req.id}?</h2>
          <p className="text-slate-500 text-[12px] mb-1">
            <span className="font-bold">"{req.purpose}"</span> by {req.name}
          </p>
          <p className="text-red-500 text-[11px] font-bold">This action is permanent and cannot be undone.</p>
          {error && <p className="text-red-600 text-[11px] font-bold bg-red-50 px-3 py-2 rounded-lg mt-3">{error}</p>}
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose} disabled={deleting}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-[12px] hover:bg-slate-50 transition-all disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-[12px] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {deleting ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Deleting…</> : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Requests Tab — full CRUD (mirrors DashboardPage request section)
// ─────────────────────────────────────────────────────────────────────────────
function RequestsTab({ currentUser, onLogout, onSwitchRole }) {
  const [requests,      setRequests]      = useState([]);
  const [filterOptions, setFilterOptions] = useState({ names: [], depts: [], assignedDepts: [] });
  const [pagination,    setPagination]    = useState({ total: 0, page: 1, limit: 50, totalPages: 1, hasNext: false, hasPrev: false });
  const [filters,       setFilters]       = useState({ name: "", dept: "", assignedDept: "", assignedStatus: "", type: "", priority: "", startDate: null, endDate: null, search: "" });
  const [chatLogs,      setChatLogs]      = useState({});
  const [selectedReq,   setSelectedReq]   = useState(null);
  const [activeModal,   setActiveModal]   = useState(null);
  const [closeTicketReq, setCloseTicketReq] = useState(null);
  const [editReq,       setEditReq]       = useState(null);
  const [deleteReq,     setDeleteReq]     = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [isFiltering,   setIsFiltering]   = useState(false);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [toast,         setToast]         = useState(null);
  const toastRef   = useRef(null);
  const selectedRef = useRef(null);
  const isFetching  = useRef(false);
  const debounce    = useRef(null);

  selectedRef.current = selectedReq;

  const loadRequests = useCallback(async (page = 1, f = {}, silent = false) => {
    if (isFetching.current && !silent) return;
    if (!silent) setIsFiltering(true);
    isFetching.current = true;
    try {
      const res = await fetchRequests({ page, limit: 50, ...f });
      if (res?.data) {
        setRequests(res.data);
        setPagination(res.pagination);
        if (selectedRef.current) {
          const updated = res.data.find(r => r.id === selectedRef.current.id);
          if (updated) setSelectedReq(updated);
        }
      } else {
        setRequests(Array.isArray(res) ? res : []);
      }
      setCurrentPage(page);
    } catch { if (!silent) setLoading(false); }
    finally { setIsFiltering(false); setLoading(false); isFetching.current = false; }
  }, []);

  useEffect(() => {
    fetchFilterOptions().then(setFilterOptions).catch(() => {});
    loadRequests(1, filters);
  }, []);  // eslint-disable-line

  useEffect(() => { loadRequests(currentPage, filters); }, [filters, currentPage]); // eslint-disable-line

  const showToast = (type, message) => {
    clearTimeout(toastRef.current);
    setToast({ type, message });
    toastRef.current = setTimeout(() => setToast(null), 4000);
  };

  const handleOpenDetails = async (row) => {
    setSelectedReq(row);
    setActiveModal("details");
    if (!row.seen) {
      setTimeout(async () => {
        setRequests(prev => prev.map(r => r.id === row.id ? { ...r, seen: true } : r));
        await markRequestSeen(row.id).catch(() => {});
      }, 300);
    }
    try {
      const res = await fetchChat(row.id);
      setChatLogs(prev => ({ ...prev, [row.id]: res?.data ?? res }));
    } catch {}
  };

  const handleSendMessage = async (reqId, message) => {
    setChatLogs(prev => ({ ...prev, [reqId]: [...(prev[reqId] || []), message] }));
    try {
      let saved;
      if      (message.type === "message")                          saved = await sendText(reqId, message.text, message.replyTo);
      else if (message.type === "voice")                            saved = await sendVoice(reqId, message.voiceBlob, message.duration, message.replyTo);
      else if (message.type === "file" || message.type === "mixed") saved = await sendFile(reqId, message.fileBlob, message.text, message.replyTo);
      if (saved) {
        setChatLogs(prev => ({ ...prev, [reqId]: (prev[reqId] || []).map(m => m === message ? saved : m) }));
        loadRequests(currentPage, filters, true);
      }
    } catch {}
  };

  const handleApproval = async (reqId, decision, _dt, _u, comment, newDept, checkingDeadline, checkingReason, extras = {}) => {
    const updated = await submitApproval(reqId, decision, comment, newDept, checkingDeadline, checkingReason, extras);
    setRequests(prev => prev.map(r => r.id === reqId ? { ...updated, seen: true } : r));
    if (selectedReq?.id === reqId) setSelectedReq({ ...updated, seen: true });
    try { const res = await fetchChat(reqId); setChatLogs(prev => ({ ...prev, [reqId]: res?.data ?? res })); } catch {}
  };

  const handleAcknowledge = async (reqId, status) => {
    try {
      const updated = await acknowledgeRequest(reqId, status);
      setRequests(prev => prev.map(r => r.id === reqId ? { ...updated, seen: true } : r));
      if (selectedReq?.id === reqId) setSelectedReq({ ...updated, seen: true });
    } catch {}
  };

  const handleAddRequest = async (data) => {
    const saved = await createRequest(data);
    setRequests(prev => [saved, ...prev]);
    setActiveModal(null);
    showToast("success", "Request added successfully.");
  };

  const handleConfirmClose = async (reqId, note, file) => {
    try {
      const updated = await closeRequest(reqId, note, file);
      setRequests(prev => prev.map(r => r.id === reqId ? { ...updated, seen: true } : r));
      setSelectedReq({ ...updated, seen: true });
      const res = await fetchChat(reqId);
      setChatLogs(prev => ({ ...prev, [reqId]: res?.data ?? res }));
    } finally { setCloseTicketReq(null); }
  };

  const handleEdit = async (reqId, data) => {
    const updated = await editRequest(reqId, data);
    setRequests(prev => prev.map(r => r.id === reqId ? { ...updated, seen: true } : r));
    showToast("success", "Request updated.");
  };

  const handleDelete = async (reqId) => {
    await deleteRequest(reqId);
    setRequests(prev => prev.filter(r => r.id !== reqId));
    showToast("success", "Request deleted.");
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2">
      <FilterBar
        currentUser={currentUser}
        filters={filters}
        filterOptions={filterOptions}
        requestCount={pagination.total}
        onFilterChange={f => { setCurrentPage(1); setFilters(f); }}
        onSearchChange={val => {
          clearTimeout(debounce.current);
          debounce.current = setTimeout(() => { setCurrentPage(1); setFilters(p => ({ ...p, search: val })); }, 300);
        }}
        onAddRequest={() => setActiveModal("add")}
        onShowInstructions={() => {}}
        onLogout={onLogout}
        onSwitchRole={onSwitchRole}
      />

      <div className={`flex-1 min-h-0 transition-opacity duration-200 ${isFiltering ? "opacity-50 pointer-events-none" : ""}`}>
        <RequestTable
          requests={requests}
          currentUser={currentUser}
          onOpenDetails={handleOpenDetails}
          onMarkUnread={id => markRequestUnread(id).then(() => loadRequests(currentPage, filters, true))}
          onAcknowledge={handleAcknowledge}
          onEdit={row => setEditReq(row)}
          onDelete={row => setDeleteReq(row)}
        />
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex-shrink-0 flex items-center justify-center gap-3 py-2">
          <button onClick={() => setCurrentPage(p => p - 1)} disabled={!pagination.hasPrev}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-all">← Prev</button>
          <span className="text-slate-500 font-medium">Page {pagination.page} of {pagination.totalPages}</span>
          <button onClick={() => setCurrentPage(p => p + 1)} disabled={!pagination.hasNext}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-all">Next →</button>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] px-4 py-3 rounded-xl shadow-xl text-white text-sm font-black ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      {activeModal === "details" && selectedReq && (
        <DetailsModal
          req={selectedReq}
          chatLogs={chatLogs[selectedReq.id] || []}
          currentUser={currentUser}
          onClose={() => setActiveModal(null)}
          onSendMessage={handleSendMessage}
          onApproval={handleApproval}
          onOpenCloseTicket={() => { setCloseTicketReq(selectedReq); setActiveModal(null); }}
          onAcknowledge={handleAcknowledge}
        />
      )}
      {activeModal === "add" && (
        <AddRequestModal currentUser={currentUser} onClose={() => setActiveModal(null)} onSubmit={handleAddRequest} />
      )}
      {closeTicketReq && (
        <CloseTicketModal
          req={closeTicketReq}
          onClose={() => setCloseTicketReq(null)}
          onConfirmClose={handleConfirmClose}
        />
      )}
      {editReq && (
        <EditRequestModal req={editReq} onClose={() => setEditReq(null)} onSave={handleEdit} />
      )}
      {deleteReq && (
        <DeleteConfirmModal req={deleteReq} onClose={() => setDeleteReq(null)} onConfirm={handleDelete} />
      )}

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Management Tab — GN route requests with full action panels
// ─────────────────────────────────────────────────────────────────────────────
function MgmtBadge({ status, pending = "Pending" }) {
  if (!status || status === "--") return <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{pending}</span>;
  if (status === "Approved")      return <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Approved</span>;
  if (status === "Rejected")      return <span className="text-xs font-black text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Rejected</span>;
  return <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{status}</span>;
}

function MgmtActionPanel({ row, onSubmit, onCancel, loading }) {
  const [decision, setDecision] = useState(null);
  const [comment,  setComment]  = useState("");

  const options = [
    { key: "Approved", label: "Approve",      cls: { active: "bg-emerald-600 text-white border-emerald-600", idle: "bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50" } },
    ...(row.isGnRoute ? [{ key: "Checking", label: "Checking", cls: { active: "bg-blue-600 text-white border-blue-600", idle: "bg-white text-blue-700 border-blue-300 hover:bg-blue-50" } }] : []),
    { key: "Rejected", label: "Reject",       cls: { active: "bg-red-600 text-white border-red-600",     idle: "bg-white text-red-700 border-red-300 hover:bg-red-50" } },
    { key: "Close",    label: "Close Ticket", cls: { active: "bg-slate-700 text-white border-slate-700", idle: "bg-white text-slate-600 border-slate-300 hover:bg-slate-50" } },
  ];

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
      <p className="text-xs font-black text-amber-800 uppercase tracking-wide">Decision — {row.purpose}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(({ key, label, cls }) => {
          const isCurrent = row.hodStatus === key;
          return (
            <button key={key} onClick={() => !isCurrent && setDecision(key)} disabled={isCurrent}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black transition-all border-2 ${isCurrent ? "opacity-40 cursor-not-allowed bg-slate-100 text-slate-500 border-slate-200" : decision === key ? cls.active : cls.idle}`}>
              {label}
            </button>
          );
        })}
      </div>
      <textarea rows={2} placeholder="Comment (optional)…" value={comment} onChange={e => setComment(e.target.value)}
        className="w-full text-xs border border-amber-200 rounded-lg p-2.5 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-amber-400" />
      <div className="flex gap-2">
        <button onClick={() => { if (decision) onSubmit(row.id, decision, comment); }}
          disabled={!decision || loading}
          className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-black rounded-lg transition-all">
          {loading ? "Submitting…" : "Confirm"}
        </button>
        <button onClick={onCancel} disabled={loading}
          className="px-5 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-black rounded-lg hover:bg-slate-50">
          Cancel
        </button>
      </div>
    </div>
  );
}

function MgmtRow({ row, index, onViewDetails }) {
  const rowBg = row.isClosed ? "bg-emerald-50/40" : row.hodStatus === "Rejected" ? "bg-red-50/40" : "";

  return (
    <tr
      className={`border-b border-slate-100 hover:bg-amber-50/30 transition-colors cursor-pointer ${rowBg}`}
      onClick={() => onViewDetails(row)}
    >
      <td className="px-3 py-3 text-center text-xs text-slate-500 font-bold">{index + 1}</td>
      <td className="px-3 py-3 text-xs text-slate-600 whitespace-nowrap">{row.date}</td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black text-slate-800">{row.name}</span>
          {row.isGnRoute && <span className="text-[9px] font-black bg-purple-600 text-white px-1.5 py-0.5 rounded-full">GN</span>}
        </div>
        <p className="text-[10px] text-slate-500">{row.empId} · {row.dept}</p>
      </td>
      <td className="px-3 py-3">
        <p className="text-xs font-bold text-blue-600">{row.purpose}</p>
        {row.description && <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{row.description}</p>}
      </td>
      <td className="px-3 py-3 text-xs text-slate-600 whitespace-nowrap">{row.assignedDept || "—"}</td>
      <td className="px-3 py-3 text-center"><MgmtBadge status={row.rmStatus} /></td>
      <td className="px-3 py-3 text-center"><MgmtBadge status={row.hodStatus} /></td>
      <td className="px-3 py-3 text-center" onClick={e => e.stopPropagation()}>
        {row.isClosed ? (
          <button
            onClick={() => onViewDetails(row)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-black rounded-lg transition-all active:scale-95 mx-auto whitespace-nowrap"
          >
            <MessageSquare size={13} /> View Details
          </button>
        ) : (
          <button
            onClick={() => onViewDetails(row)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-[11px] font-black rounded-lg transition-all active:scale-95 mx-auto whitespace-nowrap"
          >
            <ShieldCheck size={13} /> Take Action
          </button>
        )}
      </td>
    </tr>
  );
}

function ManagementTab({ currentUser }) {
  const [rows,          setRows]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedReq,   setSelectedReq]   = useState(null);
  const [chatLogs,      setChatLogs]      = useState({});
  const [closeTicketReq, setCloseTicketReq] = useState(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try { const data = await fetchHodPendingRequests(); setRows(Array.isArray(data) ? data : (data?.data ?? [])); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleViewDetails = useCallback(async (row) => {
    setSelectedReq(row);
    try {
      const result = await fetchChat(row.id);
      setChatLogs(prev => ({ ...prev, [row.id]: result?.data ?? result }));
    } catch {}
  }, []);

  const handleSendMessage = async (reqId, message) => {
    setChatLogs(prev => ({ ...prev, [reqId]: [...(prev[reqId] || []), message] }));
    try {
      let saved;
      if      (message.type === "message")                           saved = await sendText(reqId, message.text, message.replyTo);
      else if (message.type === "voice")                             saved = await sendVoice(reqId, message.voiceBlob, message.duration, message.replyTo);
      else if (message.type === "file" || message.type === "mixed")  saved = await sendFile(reqId, message.fileBlob, message.text, message.replyTo);
      if (saved) setChatLogs(prev => ({ ...prev, [reqId]: (prev[reqId] || []).map(m => m === message ? saved : m) }));
    } catch {}
  };

  const handleApproval = async (reqId, decision, dateTime, user, comment, newDept, checkingDeadline, checkingReason, extras = {}) => {
    const updated = await submitApproval(reqId, decision, comment, newDept, checkingDeadline, checkingReason, extras);
    setRows(prev => prev.map(r => r.id === reqId ? { ...updated, seen: true } : r));
    if (selectedReq?.id === reqId) setSelectedReq({ ...updated, seen: true });
    try {
      const result = await fetchChat(reqId);
      setChatLogs(prev => ({ ...prev, [reqId]: result?.data ?? result }));
    } catch {}
    load(true);
  };

  const handleConfirmClose = async (reqId, note, file) => {
    try {
      const updated = await closeRequest(reqId, note, file);
      setRows(prev => prev.map(r => r.id === reqId ? { ...updated, seen: true } : r));
      if (selectedReq?.id === reqId) setSelectedReq({ ...updated, seen: true });
      const result = await fetchChat(reqId);
      setChatLogs(prev => ({ ...prev, [reqId]: result?.data ?? result }));
    } finally {
      setCloseTicketReq(null);
    }
  };

  return (
    <>
      <div className="flex-1 min-h-0 flex flex-col gap-3">
        <div className="flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-slate-500 font-bold">{rows.length} GN route requests</span>
          <button onClick={() => load(true)} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-600 text-[11px] font-black rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm">
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
        <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 overflow-auto shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-amber-600 text-white text-[11px] font-black uppercase tracking-wide">
                <tr>
                  {["Sl.","Date","Employee","Purpose / Desc","Assigned Dept","RM Status","HOD Status","Action"].map(h => (
                    <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-slate-400 font-medium">No GN route requests found.</td></tr>
                ) : rows.map((r, i) => (
                  <MgmtRow key={r.id} row={r} index={i} onViewDetails={handleViewDetails} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedReq && (
        <DetailsModal
          req={selectedReq}
          chatLogs={chatLogs}
          currentUser={currentUser}
          onClose={() => setSelectedReq(null)}
          onSendMessage={handleSendMessage}
          onApproval={handleApproval}
          onOpenCloseTicket={(req) => { setCloseTicketReq(req); setSelectedReq(null); }}
          onAcknowledge={() => {}}
        />
      )}
      {closeTicketReq && (
        <CloseTicketModal
          req={closeTicketReq}
          onClose={() => setCloseTicketReq(null)}
          onConfirmClose={handleConfirmClose}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Food Admin Tab — subscription CRUD + report
// ─────────────────────────────────────────────────────────────────────────────
function FoodAdminTab({ currentUser }) {
  const [subs,          setSubs]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [addEmpId,      setAddEmpId]      = useState("");
  const [addPeriod,     setAddPeriod]     = useState("permanent");
  const [addPeriodDate, setAddPeriodDate] = useState("");
  const [addLoading,    setAddLoading]    = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast,         setToast]         = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminGetFoodSubscriptions();
      setSubs(Array.isArray(result) ? result : []);
    }
    catch { showToast("error", "Failed to load subscriptions."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!addEmpId.trim()) return;
    if (addPeriod !== "permanent" && !addPeriodDate) {
      showToast("error", `Please select a ${addPeriod === "weekly" ? "date" : "month"}.`);
      return;
    }
    setAddLoading(true);
    try {
      await adminSubscribeUser(addEmpId.trim(), addPeriod, addPeriodDate || null);
      setAddEmpId("");
      setAddPeriod("permanent");
      setAddPeriodDate("");
      await load();
      showToast("success", `Subscribed ${addEmpId.trim()} to food (${addPeriod}).`);
    } catch (e) { showToast("error", e.message || "Failed to subscribe."); }
    finally { setAddLoading(false); }
  };

  const handleToggle = async (empId, current) => {
    try {
      await adminToggleFoodUser(empId, !current);
      setSubs(prev => prev.map(s => s.empId === empId ? { ...s, isActive: !current } : s));
      showToast("success", `User ${!current ? "activated" : "deactivated"}.`);
    } catch { showToast("error", "Failed to update."); }
  };

  const handleDelete = async (empId) => {
    try {
      await adminDeleteFoodUser(empId);
      setSubs(prev => prev.filter(s => s.empId !== empId));
      setConfirmDelete(null);
      showToast("success", "Subscription removed.");
    } catch { showToast("error", "Failed to remove."); }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`px-4 py-3 rounded-xl text-[12px] font-bold border ${toast.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {toast.msg}
        </div>
      )}

      {/* Subscriptions CRUD table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-white">
          <div className="flex items-center gap-2">
            <UtensilsCrossed size={18} className="text-orange-500" />
            <h3 className="font-black text-slate-800 text-[14px]">Food Subscriptions</h3>
            <span className="text-[11px] text-slate-400 font-bold">({subs.length} total)</span>
          </div>
          <button onClick={() => load()} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Add subscription */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={addEmpId}
            onChange={e => setAddEmpId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            placeholder="Employee ID (e.g. GN-2001)"
            className="flex-1 min-w-[160px] px-3 py-2 text-[12px] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          />
          <SearchableSelect
            value={addPeriod}
            onChange={val => { setAddPeriod(val); setAddPeriodDate(""); }}
            options={[
              { value: "permanent", label: "Permanent" },
              { value: "weekly",    label: "Weekly (1 week)" },
              { value: "monthly",   label: "Monthly (1 month)" },
            ]}
            triggerClassName="px-3 py-2 text-[12px] border border-slate-200 rounded-xl bg-white font-bold text-slate-700 hover:border-orange-300"
          />
          {addPeriod === "weekly" && (
            <input
              type="date"
              value={addPeriodDate}
              onChange={e => setAddPeriodDate(e.target.value)}
              className="px-3 py-2 text-[12px] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              title="Pick any date within the desired week"
            />
          )}
          {addPeriod === "monthly" && (
            <input
              type="month"
              value={addPeriodDate}
              onChange={e => setAddPeriodDate(e.target.value)}
              className="px-3 py-2 text-[12px] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              title="Select the month for subscription"
            />
          )}
          <button
            onClick={handleAdd}
            disabled={addLoading || !addEmpId.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-[12px] font-black rounded-xl disabled:opacity-50 transition-all active:scale-95"
          >
            {addLoading ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <UserPlus size={14} />}
            Subscribe
          </button>
        </div>

        {/* Table */}
        <div className="table-scroll">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Sl.No", "Employee ID", "Name", "Department", "Status", "Start Date", "Suspended From", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-black text-slate-400 text-[10px] uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center">
                  <div className="w-6 h-6 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : subs.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400 font-medium text-[12px]">No food subscriptions found.</td></tr>
              ) : subs.map((s, i) => (
                <tr key={s.empId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3 font-mono font-bold text-orange-600">{s.empId}</td>
                  <td className="px-4 py-3 font-black text-slate-800">{s.name}</td>
                  <td className="px-4 py-3 text-slate-600">{s.dept}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${s.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.isActive ? "bg-green-500" : "bg-red-400"}`} />
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.startDate}</td>
                  <td className="px-4 py-3 text-slate-500">{s.suspendedFrom || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(s.empId, s.isActive)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all active:scale-95 ${s.isActive ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
                      >
                        {s.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(s)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-red-50 text-red-600 hover:bg-red-100 transition-all active:scale-95"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 size={22} className="text-red-600" />
              </div>
              <h3 className="font-black text-slate-800">Remove Subscription?</h3>
              <p className="text-[12px] text-slate-500 mt-1">
                Remove food subscription for <span className="font-bold">{confirmDelete.name}</span> ({confirmDelete.empId})?
              </p>
              <p className="text-[11px] text-red-500 font-bold mt-1">All cancellation records will also be deleted.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-[12px] hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmDelete.empId)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-[12px] transition-all active:scale-95">
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report + notification control embedded from FoodPage */}
      <FoodPage currentUser={currentUser} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// User Roles Tab
// ─────────────────────────────────────────────────────────────────────────────
const ALL_ROLES = ["Requestor","RM","HOD","DeptHOD","Management","Admin","HR","FoodCommittee","Intern","SuperUser"];

function RoleModal({ title, initial, onSave, onClose, excludeEmpId }) {
  const [empId, setEmpId] = useState(initial?.empId || "");
  const [role,  setRole]  = useState(initial?.role  || "Requestor");
  const [dept,  setDept]  = useState(initial?.dept  || "");
  const [err,   setErr]   = useState("");
  const [saving,setSaving]= useState(false);
  const isEdit = !!initial?.id;

  const handleSave = async () => {
    if (!isEdit && !empId.trim()) { setErr("Emp ID is required."); return; }
    if (!dept.trim()) { setErr("Department is required."); return; }
    setSaving(true); setErr("");
    try {
      await onSave(isEdit ? initial.id : empId.trim(), role, dept);
      onClose();
    } catch (e) { setErr(e.message || "Failed."); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-slate-800 text-[15px]">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={15}/></button>
        </div>
        {err && <p className="text-red-600 text-[11px] font-bold bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
        {!isEdit && (
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Emp ID</label>
            <input value={empId} onChange={e => setEmpId(e.target.value)} placeholder="e.g. AC-1053"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-indigo-400"/>
          </div>
        )}
        {isEdit && (
          <div className="bg-slate-50 rounded-xl px-3 py-2 text-[12px] text-slate-600 font-bold">
            {initial.empId} — {initial.name}
          </div>
        )}
        <div className="space-y-1">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Role</label>
          <select value={role} onChange={e => setRole(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-indigo-400 bg-white">
            {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Department</label>
          <select value={dept} onChange={e => setDept(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-indigo-400 bg-white">
            <option value="">-- Select Department --</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-[12px] hover:bg-slate-50 transition-all">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-[12px] transition-all active:scale-95">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function UserRolesTab() {
  const [rows,         setRows]         = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [search,       setSearch]       = useState("");
  const [filterRole,   setFilterRole]   = useState("");
  const [filterDept,   setFilterDept]   = useState("");
  const [addModal,     setAddModal]     = useState(false);
  const [editEntry,    setEditEntry]    = useState(null);
  const [deleteEntry,  setDeleteEntry]  = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [toast,        setToast]        = useState(null);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchUserRoles({ search, role: filterRole, dept: filterDept });
      setRows(data);
    } catch (e) { showToast("error", e.message || "Failed to load."); }
    finally { setLoading(false); }
  }, [search, filterRole, filterDept]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (empId, role, dept) => {
    await addUserRole(empId, role, dept);
    showToast("success", `Role added for ${empId}.`);
    load();
  };

  const handleEdit = async (id, role, dept) => {
    await updateUserRole(id, role, dept);
    showToast("success", "Role updated.");
    load();
  };

  const handleToggle = async (row) => {
    try {
      await toggleUserRole(row.id);
      setRows(prev => prev.map(r => r.id === row.id ? { ...r, isActive: !r.isActive } : r));
      showToast("success", `Role ${row.isActive ? "disabled" : "enabled"}.`);
    } catch (e) { showToast("error", e?.response?.data?.error || e.message || "Failed."); }
  };

  const handleDelete = async () => {
    if (!deleteEntry) return;
    setDeleting(true);
    try {
      await deleteUserRole(deleteEntry.id);
      showToast("success", `Role deleted.`);
      setDeleteEntry(null);
      load();
    } catch (e) { showToast("error", e.message || "Failed."); }
    finally { setDeleting(false); }
  };

  const ROLE_COLORS = {
    SuperUser: "bg-yellow-100 text-yellow-800", Admin: "bg-orange-100 text-orange-700",
    Management: "bg-rose-100 text-rose-700", DeptHOD: "bg-teal-100 text-teal-700",
    HOD: "bg-purple-100 text-purple-700", RM: "bg-blue-100 text-blue-700",
    Requestor: "bg-slate-100 text-slate-600", HR: "bg-pink-100 text-pink-700",
    FoodCommittee: "bg-green-100 text-green-700", Intern: "bg-indigo-100 text-indigo-600",
  };

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`px-4 py-3 rounded-xl text-[12px] font-bold border ${toast.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header + filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center gap-2">
            <KeyRound size={18} className="text-indigo-500"/>
            <h3 className="font-black text-slate-800 text-[14px]">User Roles</h3>
            <span className="text-[11px] text-slate-400 font-bold">({rows.length} entries)</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""}/>
            </button>
            <button onClick={() => setAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[12px] transition-all active:scale-95 shadow-sm">
              <Plus size={13}/> Add Role
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Emp ID or Name…"
              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-[12px] bg-white focus:outline-none focus:border-indigo-400"/>
          </div>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-[12px] bg-white focus:outline-none focus:border-indigo-400">
            <option value="">All Roles</option>
            {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-[12px] bg-white focus:outline-none focus:border-indigo-400 max-w-[200px]">
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {(search || filterRole || filterDept) && (
            <button onClick={() => { setSearch(""); setFilterRole(""); setFilterDept(""); }}
              className="flex items-center gap-1 px-2.5 py-2 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-500 hover:bg-slate-100 bg-white transition-all">
              <X size={11}/> Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left font-black text-slate-500 uppercase tracking-wider text-[10px]">#</th>
                <th className="px-4 py-3 text-left font-black text-slate-500 uppercase tracking-wider text-[10px]">Emp ID</th>
                <th className="px-4 py-3 text-left font-black text-slate-500 uppercase tracking-wider text-[10px]">Name</th>
                <th className="px-4 py-3 text-left font-black text-slate-500 uppercase tracking-wider text-[10px]">Role</th>
                <th className="px-4 py-3 text-left font-black text-slate-500 uppercase tracking-wider text-[10px]">Department</th>
                <th className="px-4 py-3 text-center font-black text-slate-500 uppercase tracking-wider text-[10px]">Status</th>
                <th className="px-4 py-3 text-center font-black text-slate-500 uppercase tracking-wider text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400 font-bold">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400 font-bold">No roles found.</td></tr>
              ) : rows.map((r, i) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-400 font-bold">{i + 1}</td>
                  <td className="px-4 py-3 font-black text-slate-700">{r.empId}</td>
                  <td className="px-4 py-3 text-slate-600 font-medium">{r.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${ROLE_COLORS[r.role] || "bg-slate-100 text-slate-600"}`}>{r.role}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-medium">{r.dept}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${r.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${r.isActive ? "bg-green-500" : "bg-red-400"}`} />
                      {r.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setEditEntry(r)}
                        className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 transition-all" title="Edit">
                        <Pencil size={13}/>
                      </button>
                      <button onClick={() => handleToggle(r)}
                        className={`p-1.5 rounded-lg transition-all ${r.isActive ? "text-amber-500 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}
                        title={r.isActive ? "Disable" : "Enable"}>
                        {r.isActive ? <ShieldOff size={13}/> : <ShieldCheck size={13}/>}
                      </button>
                      <button onClick={() => setDeleteEntry(r)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-all" title="Delete">
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {addModal && (
        <RoleModal title="Add Role" initial={null} onSave={handleAdd} onClose={() => setAddModal(false)}/>
      )}

      {/* Edit Modal */}
      {editEntry && (
        <RoleModal title="Edit Role" initial={editEntry} onSave={handleEdit} onClose={() => setEditEntry(null)}/>
      )}

      {/* Delete Confirm */}
      {deleteEntry && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 size={22} className="text-red-600"/>
              </div>
              <h3 className="font-black text-slate-800">Delete Role Entry?</h3>
              <p className="text-[12px] text-slate-500 mt-1">
                Remove <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${ROLE_COLORS[deleteEntry.role] || "bg-slate-100 text-slate-600"}`}>{deleteEntry.role}</span> in <span className="font-bold">{deleteEntry.dept}</span> for <span className="font-bold">{deleteEntry.empId}</span>?
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteEntry(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-[12px] hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-[12px] transition-all active:scale-95">
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab bar button
// ─────────────────────────────────────────────────────────────────────────────
function TabBtn({ label, icon, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-[12px] transition-all whitespace-nowrap ${
        active ? "bg-yellow-400 text-slate-900 shadow" : "text-slate-400 hover:text-white hover:bg-white/10"
      }`}>
      {icon} {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main SuperUser Home
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { key: "requests",   label: "Requests",        icon: <ClipboardList size={14} /> },
  { key: "management", label: "GN Requests",      icon: <ShieldCheck size={14} /> },
  { key: "users",      label: "Users",             icon: <Users size={14} /> },
  { key: "roles",      label: "Roles",             icon: <KeyRound size={14} /> },
  { key: "food",       label: "Food",              icon: <UtensilsCrossed size={14} /> },
  { key: "report",     label: "Admin Report",      icon: <BarChart2 size={14} /> },
];

export default function SuperUserHome({ currentUser, onLogout, onSwitchRole }) {
  const [activeTab, setActiveTab] = useState("requests");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 font-sans flex flex-col" style={{ height: "100dvh" }}>

      {/* Header */}
      <header className="flex-shrink-0 border-b border-white/10">
        <div className="max-w-full px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-base tracking-tight leading-tight">Super User Hub</h1>
              <p className="text-slate-400 text-[10px] font-medium">Full system access · {currentUser?.name} · {currentUser?.empId}</p>
            </div>
          </div>
          <button onClick={onLogout}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 flex-shrink-0">
            <LogOut size={14} /> Logout
          </button>
        </div>

        {/* Tab bar */}
        <div className="px-4 sm:px-6 pb-2 flex gap-1 overflow-x-auto">
          {TABS.map(t => (
            <TabBtn key={t.key} label={t.label} icon={t.icon} active={activeTab === t.key} onClick={() => setActiveTab(t.key)} />
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">

        {/* Requests — has its own FilterBar so no extra padding needed */}
        {activeTab === "requests" && (
          <div className="flex-1 min-h-0 flex flex-col gap-2 px-3 sm:px-6 pt-3 pb-6 overflow-hidden">
            <RequestsTab currentUser={currentUser} onLogout={onLogout} onSwitchRole={onSwitchRole} />
          </div>
        )}

        {/* GN Requests */}
        {activeTab === "management" && (
          <div className="flex-1 min-h-0 flex flex-col px-3 sm:px-6 py-4 pb-6 overflow-hidden">
            <ManagementTab currentUser={currentUser} />
          </div>
        )}

        {/* Users — UserManagementPage is designed to be embedded */}
        {activeTab === "users" && (
          <div className="flex-1 min-h-0 overflow-y-auto bg-[#f8fafc]">
            <UserManagementPage currentUser={currentUser} />
          </div>
        )}

        {/* Roles — User Roles CRUD */}
        {activeTab === "roles" && (
          <div className="flex-1 min-h-0 overflow-y-auto bg-[#f8fafc] p-4 sm:p-6">
            <UserRolesTab />
          </div>
        )}

        {/* Food — admin CRUD + report */}
        {activeTab === "food" && (
          <div className="flex-1 min-h-0 overflow-y-auto bg-[#f8fafc] p-4 sm:p-6">
            <FoodAdminTab currentUser={currentUser} />
          </div>
        )}

        {/* Admin Report — AdminReportPage embedded */}
        {activeTab === "report" && (
          <div className="flex-1 min-h-0 overflow-y-auto bg-[#f8fafc]">
            <AdminReportPage />
          </div>
        )}
      </main>
    </div>
  );
}
