/**
 * Chat Service
 * Maps frontend chat actions to backend /api/requests/:id/chat endpoints.
 */

import { get, postForm } from "./api";

/**
 * GET /api/requests/:id/chat
 * Returns all messages for a request.
 */
export async function fetchChat(requestId) {
  return get(`/requests/${requestId}/chat`);
}

/**
 * POST /api/requests/:id/chat
 * Sends a plain text message.
 */
export async function sendText(requestId, text) {
  const fd = new FormData();
  fd.append("type", "message");
  fd.append("text", text);
  return postForm(`/requests/${requestId}/chat`, fd);
}

/**
 * POST /api/requests/:id/chat
 * Sends a file (or image) attachment with optional caption.
 */
export async function sendFile(requestId, fileBlob, caption = "") {
  const fd = new FormData();
  fd.append("type", "file");
  fd.append("text", caption);
  fd.append("file", fileBlob);
  return postForm(`/requests/${requestId}/chat`, fd);
}

/**
 * POST /api/requests/:id/chat
 * Sends a voice message.
 */
export async function sendVoice(requestId, voiceBlob, duration = null) {
  const fd = new FormData();
  fd.append("type", "voice");
  fd.append("file", voiceBlob, "voice.webm");
  if (duration !== null) fd.append("duration", duration);
  return postForm(`/requests/${requestId}/chat`, fd);
}

/**
 * POST /api/requests/:id/chat
 * Sends an approval card message (logged when an approval decision is made).
 */
export async function sendApprovalMessage(requestId, { text, status, purpose, changedDept, originalDept }) {
  const fd = new FormData();
  fd.append("type",         "approval");
  fd.append("text",         text         || "");
  fd.append("status",       status       || "");
  fd.append("purpose",      purpose      || "");
  fd.append("changedDept",  changedDept  || "");
  fd.append("originalDept", originalDept || "");
  return postForm(`/requests/${requestId}/chat`, fd);
}