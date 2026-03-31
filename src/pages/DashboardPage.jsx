import { useState, useEffect } from "react";
import { getNowDate, getNowTime } from "../utils/dateTime";

import { fetchRequests, createRequest, submitApproval, markRequestSeen, markRequestUnread, closeRequest } from "../services/requestService";
import { fetchChat, sendText, sendFile, sendVoice } from "../services/chatService";
import { getStoredUser } from "../services/authService";

import FilterBar from "../components/layout/FilterBar";
import RequestTable from "../components/table/RequestTable";
import DetailsModal from "../components/modals/DetailsModal";
import CloseTicketModal from "../components/modals/CloseTicketModal";
import AddRequestModal from "../components/modals/AddRequestModal";
import InstructionsModal from "../components/modals/InstructionsModal";

export default function DashboardPage({ onLogout }) {
  const [requests, setRequests]     = useState([]);
  const [chatLogs, setChatLogs]     = useState({});
  const [selectedReq, setSelectedReq] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [closeTicketReq, setCloseTicketReq] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const currentUser = getStoredUser();

  useEffect(() => {
    (async () => {
      const reqs = await fetchRequests();
      setRequests(reqs);
    })();
  }, []);

  const handleOpenDetails = async (row) => {
    setSelectedReq(row);
    setActiveModal("details");

    if (!row.seen) {
      setTimeout(async () => {
        setRequests((prev) => prev.map((r) => (r.id === row.id ? { ...r, seen: true } : r)));
        await markRequestSeen(row.id);
      }, 300);
    }

    const messages = await fetchChat(row.id);
    setChatLogs((prev) => ({ ...prev, [row.id]: messages }));
  };

  const handleMarkUnread = async (rowId) => {
    setRequests((prev) => prev.map((r) => (r.id === rowId ? { ...r, seen: false } : r)));
    await markRequestUnread(rowId);
  };

  // ── Send chat message ─────────────────────────────────────────
  const handleSendMessage = async (reqId, message) => {
    setChatLogs((prev) => ({
      ...prev,
      [reqId]: [...(prev[reqId] || []), message],
    }));

    // Mark row unseen so others notice new activity
    setRequests((prev) => prev.map((r) => (r.id === reqId ? { ...r, seen: false } : r)));
    markRequestUnread(reqId).catch(() => {});

    try {
      let saved;
      if (message.type === "message") {
        saved = await sendText(reqId, message.text);
      } else if (message.type === "voice") {
        saved = await sendVoice(reqId, message.voiceBlob, message.duration);
      } else if (message.type === "file" || message.type === "mixed") {
        saved = await sendFile(reqId, message.fileBlob, message.text);
      } else {
        // approval / system — already logged server-side during approval action
        return;
      }

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

  // ── Approval / forwarding ─────────────────────────────────────
  const handleApproval = async (reqId, decision, dateTime, user, comment, newDept) => {
    const updater = (r) => {
      if (r.id !== reqId) return r;
      const u = { ...r };
      if (decision === "Forwarded") {
        u.forwarded    = true;
        u.forwardedBy  = user.name;
        u.forwardedAt  = dateTime;
        u.assignedDept = newDept;
      } else if (user.role === "RM") {
        u.rmStatus  = decision;
        u.rmDate    = dateTime;
      } else if (user.role === "HOD") {
        u.hodStatus = decision;
        u.hodDate   = dateTime;
      } else if (user.role === "DeptHOD") {
        u.deptHodStatus = decision;
        u.deptHodDate   = dateTime;
      }
      u.seen = false;
      return u;
    };

    setRequests((prev) => prev.map(updater));
    setSelectedReq((prev) => (prev?.id === reqId ? updater(prev) : prev));

    try {
      const updated = await submitApproval(reqId, decision, comment, newDept);
      setRequests((prev) => prev.map((r) => (r.id === reqId ? updated : r)));
      setSelectedReq((prev) => (prev?.id === reqId ? updated : prev));

      // Refresh chat to get server-saved approval card
      const messages = await fetchChat(reqId);
      setChatLogs((prev) => ({ ...prev, [reqId]: messages }));
    } catch (err) {
      console.error("Approval failed:", err);
    }
  };

  const handleAddRequest = async ({ purpose, dept, description, file }) => {
    try {
      const saved = await createRequest({ purpose, dept, description, file });
      setRequests((prev) => [saved, ...prev]);
    } catch (err) {
      console.error("Failed to create request:", err);
    }
  };

  // ── Close ticket ──────────────────────────────────────────────
  const handleConfirmCloseTicket = async (reqId, note, file) => {
    try {
      const updated = await closeRequest(reqId, note, file);
      setRequests((prev) => prev.map((r) => (r.id === reqId ? updated : r)));
      setSelectedReq(updated);

      const messages = await fetchChat(reqId);
      setChatLogs((prev) => ({ ...prev, [reqId]: messages }));
    } catch (err) {
      console.error("Failed to close ticket:", err);
    }

    setCloseTicketReq(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 font-sans text-[12px]">
      <FilterBar
        currentUser={currentUser}
        requestCount={requests.length}
        onAddRequest={() => setActiveModal("add")}
        onShowInstructions={() => setShowInstructions(true)}
        onLogout={onLogout}
      />

      <RequestTable
        requests={requests}
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
        />
      )}

      {showInstructions && (
        <InstructionsModal onClose={() => setShowInstructions(false)} />
      )}
    </div>
  );
}