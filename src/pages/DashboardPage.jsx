/**
 * pages/DashboardPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Main dashboard — owns all request state and passes filtered data to the table.
 *
 * FIX — Filter wiring:
 *   FilterBar calls onFilterChange(filters) on every change.
 *   We apply those filters here with applyFilters() before passing to the table.
 *   Filters supported: name, dept, assignedDept, status, date, free-text search.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useMemo } from "react";

import {
  fetchRequests,
  createRequest,
  submitApproval,
  markRequestSeen,
  markRequestUnread,
  closeRequest,
} from "../services/requestService";
import { fetchChat, sendText, sendFile, sendVoice } from "../services/chatService";
import { getStoredUser } from "../services/authService";

import FilterBar         from "../components/layout/FilterBar";
import RequestTable      from "../components/table/RequestTable";
import DetailsModal      from "../components/modals/DetailsModal";
import CloseTicketModal  from "../components/modals/CloseTicketModal";
import AddRequestModal   from "../components/modals/AddRequestModal";
import InstructionsModal from "../components/modals/InstructionsModal";

// ── Apply filter criteria to the full request list ────────────────────────
function applyFilters(requests, filters) {
  return requests.filter((r) => {
    // Name filter — substring match (case-insensitive)
    if (filters.name && !r.name?.toLowerCase().includes(filters.name.toLowerCase())) return false;
    // Requestor department
    if (filters.dept && r.dept !== filters.dept) return false;
    // Assigned department
    if (filters.assignedDept && r.assignedDept !== filters.assignedDept) return false;
    // Status: "open" = not closed, "closed" = closed
    if (filters.status === "open"   && r.isClosed)  return false;
    if (filters.status === "closed" && !r.isClosed) return false;
    // Date filter — match by formatted date string "DD/MM/YYYY"
    if (filters.date) {
      // Convert yyyy-mm-dd picker value to locale format for comparison
      const [y, m, d] = filters.date.split("-");
      const pickerDate = `${parseInt(d)}/${parseInt(m)}/${y}`;
      if (r.date !== pickerDate) return false;
    }
    // Free-text search across purpose, name, empId
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const hay = `${r.purpose} ${r.name} ${r.empId} ${r.dept} ${r.assignedDept}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export default function DashboardPage({ currentUser: currentUserProp, onLogout }) {
  const [requests,         setRequests]         = useState([]);
  const [chatLogs,         setChatLogs]         = useState({});
  const [filters,          setFilters]          = useState({});
  const [selectedReq,      setSelectedReq]      = useState(null);
  const [activeModal,      setActiveModal]      = useState(null);
  const [closeTicketReq,   setCloseTicketReq]   = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [loadingReqs,      setLoadingReqs]      = useState(true);
  const [fetchError,       setFetchError]       = useState("");

  // Prefer prop (from App) → fall back to localStorage
  const currentUser = currentUserProp || getStoredUser();

  // ── Computed: filtered + sorted list fed to the table ─────────────────────
  const filteredRequests = useMemo(() => applyFilters(requests, filters), [requests, filters]);

  // ── Load all requests on mount ─────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const reqs = await fetchRequests();
        setRequests(reqs);
      } catch (err) {
        setFetchError("Failed to load requests. Is the backend running?");
        console.error(err);
      } finally {
        setLoadingReqs(false);
      }
    })();
  }, []);

  // ── Open details — fetch chat messages ────────────────────────────────────
  const handleOpenDetails = async (row) => {
    setSelectedReq(row);
    setActiveModal("details");

    // Mark seen after short delay so unread highlight is still briefly visible
    if (!row.seen) {
      setTimeout(async () => {
        setRequests((prev) =>
          prev.map((r) => (r.id === row.id ? { ...r, seen: true } : r))
        );
        await markRequestSeen(row.id).catch(() => {});
      }, 300);
    }

    try {
      const messages = await fetchChat(row.id);
      setChatLogs((prev) => ({ ...prev, [row.id]: messages }));
    } catch (err) {
      console.error("Failed to load chat:", err);
    }
  };

  // ── Mark unread (right-click context menu) ────────────────────────────────
  const handleMarkUnread = async (rowId) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, seen: false } : r))
    );
    await markRequestUnread(rowId).catch((err) =>
      console.error("Failed to mark unread:", err)
    );
  };

  // ── Send chat message ─────────────────────────────────────────────────────
  // Backend sets seen=FALSE when a message is saved — we do NOT call
  // markRequestUnread here to avoid marking the sender's own ticket unread.
  const handleSendMessage = async (reqId, message) => {
    // 1. Optimistic update with local blob URLs
    setChatLogs((prev) => ({
      ...prev,
      [reqId]: [...(prev[reqId] || []), message],
    }));

    // 2. Persist to backend
    try {
      let saved;
      if (message.type === "message") {
        saved = await sendText(reqId, message.text);
      } else if (message.type === "voice") {
        saved = await sendVoice(reqId, message.voiceBlob, message.duration);
      } else if (message.type === "file" || message.type === "mixed") {
        saved = await sendFile(reqId, message.fileBlob, message.text);
      } else {
        // approval / system — already logged server-side; skip
        return;
      }

      // 3. Swap optimistic entry with real server response (has permanent URL)
      if (saved) {
        setChatLogs((prev) => ({
          ...prev,
          [reqId]: (prev[reqId] || []).map((m) => (m === message ? saved : m)),
        }));
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // ── Approval / forwarding ─────────────────────────────────────────────────
  const handleApproval = async (reqId, decision, dateTime, user, comment, newDept) => {
    // Optimistic update while API call is in flight
    const updater = (r) => {
      if (r.id !== reqId) return r;
      const u = { ...r };
      if (decision === "Forwarded") {
        u.forwarded = true; u.forwardedBy = user.name;
        u.forwardedAt = dateTime; u.assignedDept = newDept;
      } else if (user.role === "RM")      { u.rmStatus      = decision; u.rmDate      = dateTime; }
      else if (user.role === "HOD")       { u.hodStatus     = decision; u.hodDate     = dateTime; }
      else if (user.role === "DeptHOD")   { u.deptHodStatus = decision; u.deptHodDate = dateTime; }
      u.seen = false;
      return u;
    };

    setRequests((prev) => prev.map(updater));
    setSelectedReq((prev) => (prev?.id === reqId ? updater(prev) : prev));

    try {
      const updated = await submitApproval(reqId, decision, comment, newDept);
      setRequests((prev) => prev.map((r) => (r.id === reqId ? updated : r)));
      setSelectedReq((prev) => (prev?.id === reqId ? updated : prev));

      // Refresh chat — backend auto-logs the approval card
      const messages = await fetchChat(reqId);
      setChatLogs((prev) => ({ ...prev, [reqId]: messages }));
    } catch (err) {
      console.error("Approval failed:", err);
    }
  };

  // ── Add new request ───────────────────────────────────────────────────────
  // Re-throws so AddRequestModal can show an inline error on failure
  const handleAddRequest = async ({ purpose, assignedDept, description, file }) => {
    const saved = await createRequest({ purpose, assignedDept, description, file });
    // Backend creates with seen=false so RM/HOD/DeptHOD see the blue unread highlight.
    // For the CREATOR (requestor), override seen=true locally — they don't need
    // to see their own freshly-created request highlighted as "new".
    const forCreator = { ...saved, seen: true };
    setRequests((prev) => [forCreator, ...prev]);
  };

  // ── Close ticket ──────────────────────────────────────────────────────────
  // Re-throws so CloseTicketModal can show inline error; setCloseTicketReq(null)
  // in finally unmounts the modal automatically after success or failure.
  const handleConfirmCloseTicket = async (reqId, note, file) => {
    try {
      const updated = await closeRequest(reqId, note, file);
      setRequests((prev) => prev.map((r) => (r.id === reqId ? updated : r)));
      setSelectedReq(updated);

      // Refresh chat — backend creates the system closure message
      const messages = await fetchChat(reqId);
      setChatLogs((prev) => ({ ...prev, [reqId]: messages }));
    } finally {
      setCloseTicketReq(null);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loadingReqs) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc] font-sans">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading requests...</p>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc] font-sans">
        <div className="text-center bg-white p-10 rounded-3xl shadow-xl border border-red-100">
          <p className="text-red-500 font-bold text-lg mb-2">⚠ Connection Error</p>
          <p className="text-slate-500 text-sm mb-1">{fetchError}</p>
          <p className="text-slate-400 text-xs mb-4">
            Make sure the backend is running: <code className="bg-slate-100 px-1 py-0.5 rounded">npm run dev</code>
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 font-sans text-[12px]">

      <FilterBar
        currentUser={currentUser}
        requests={requests}                   // full list (for building dropdown options)
        requestCount={filteredRequests.length} // filtered count shown in sub-bar
        onFilterChange={setFilters}
        onAddRequest={() => setActiveModal("add")}
        onShowInstructions={() => setShowInstructions(true)}
        onLogout={onLogout}
      />

      <RequestTable
        requests={filteredRequests}
        currentUser={currentUser}
        onOpenDetails={handleOpenDetails}
        onMarkUnread={handleMarkUnread}
      />

      {activeModal === "details" && selectedReq && (
        <DetailsModal
          req={selectedReq}
          chatLogs={chatLogs}
          currentUser={currentUser}
          onClose={() => { setActiveModal(null); setSelectedReq(null); }}
          onSendMessage={handleSendMessage}
          onApproval={handleApproval}
          onOpenCloseTicket={(req) => setCloseTicketReq(req)}
        />
      )}

      {closeTicketReq && (
        <CloseTicketModal
          req={closeTicketReq}
          onClose={() => setCloseTicketReq(null)}
          onConfirmClose={handleConfirmCloseTicket}
        />
      )}

      {activeModal === "add" && (
        <AddRequestModal
          onClose={() => setActiveModal(null)}
          onSubmit={handleAddRequest}
          currentUser={currentUser}
        />
      )}

      {showInstructions && (
        <InstructionsModal onClose={() => setShowInstructions(false)} />
      )}
    </div>
  );
}
