/**
 * components/chat/ChatPanel.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Right panel inside DetailsModal — shows the message thread and input bar.
 *
 * Props:
 *   reqId         — request ID (used to key the send call)
 *   logs          — array of message objects for this request
 *   currentUser   — { name, role }
 *   onSendMessage — (reqId, message) => void
 *   isClosed      — boolean — true if ticket is closed
 *   canChat       — boolean — false for Admin (read-only)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useRef, useEffect } from "react";
import { MessageSquare, Lock } from "lucide-react";
import ApprovalCard      from "./ApprovalCard";
import MessageBubble     from "./MessageBubble";
import SystemMessage     from "./SystemMessage";
import ChatInputBar      from "./ChatInputBar";
import { getNowTime, getNowDate } from "../../utils/dateTime";

export default function ChatPanel({ reqId, logs, currentUser, onSendMessage, isClosed, canChat }) {
  const chatEndRef = useRef(null);

  // Auto-scroll to newest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleSend = ({ text, file, voiceBlob, voiceDuration }) => {
    const time = getNowTime();
    const date = getNowDate();

    if (!file && !voiceBlob && !text.trim()) return;

    // Determine message type from what was staged
    const type = file && voiceBlob ? "mixed"
               : file              ? "file"
               : voiceBlob         ? "voice"
               : "message";

    onSendMessage(reqId, {
      id:        Date.now(),
      author:    currentUser.name,
      role:      currentUser.role,
      time,
      date,
      type,
      text:      text.trim(),
      // Blob URLs for immediate local display (before server response arrives)
      fileBlob:  file      || null,
      fileUrl:   file      ? URL.createObjectURL(file)      : null,
      fileName:  file      ? file.name                      : null,
      isImage:   file      ? file.type.startsWith("image/") : null,
      voiceBlob: voiceBlob || null,
      voiceUrl:  voiceBlob ? URL.createObjectURL(voiceBlob) : null,
      duration:  voiceDuration || null,
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-5 gap-3">

      {/* Header */}
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1 flex-shrink-0">
        <MessageSquare size={11} /> Activity &amp; Chat
        {logs.length > 0 && (
          <span className="bg-indigo-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black ml-1">
            {logs.length}
          </span>
        )}
        {isClosed && (
          <span className="ml-auto flex items-center gap-1 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[9px] font-black">
            <Lock size={9} /> Chat Closed
          </span>
        )}
      </p>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-3 bg-slate-50 rounded-2xl p-3 border border-slate-100">
        {logs.length === 0 && (
          <p className="text-center text-slate-400 text-sm mt-10">No activity yet.</p>
        )}
        {logs.map((log) =>
          log.type === "approval" ? <ApprovalCard  key={log.id} log={log} /> :
          log.type === "system"   ? <SystemMessage key={log.id} log={log} /> :
                                    <MessageBubble key={log.id} log={log} />
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar / closed notice */}
      <div className="flex-shrink-0">
        {canChat ? (
          <ChatInputBar onSend={handleSend} />
        ) : isClosed ? (
          <div className="flex items-center justify-center gap-2 bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 text-red-500">
            <Lock size={14} />
            <span className="font-black text-[12px]">This ticket has been closed. Chat is disabled.</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 text-slate-400">
            <Lock size={14} />
            <span className="font-black text-[12px]">Read-only access</span>
          </div>
        )}
      </div>
    </div>
  );
}
