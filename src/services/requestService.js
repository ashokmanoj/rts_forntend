/**
 * Request Service
 * Maps frontend actions to backend /api/requests endpoints.
 */

import { get, postForm, patch, patchForm } from "./api";

/**
 * GET /api/requests
 * Returns all requests.
 */
export async function fetchRequests() {
  return get("/requests");
}

/**
 * POST /api/requests  (multipart)
 * Creates a new request with optional file attachment.
 */
export async function createRequest({ purpose, dept, description, file }) {
  const fd = new FormData();
  fd.append("purpose",     purpose);
  fd.append("dept",        dept);
  fd.append("description", description || "");
  if (file) fd.append("file", file);
  return postForm("/requests", fd);
}

/**
 * PATCH /api/requests/:id/approval
 * decision: "Approved" | "Rejected" | "Checking" | "Forwarded"
 */
export async function submitApproval(id, decision, comment = "", newDept = "") {
  return patch(`/requests/${id}/approval`, { decision, comment, newDept });
}

/**
 * PATCH /api/requests/:id/seen
 */
export async function markRequestSeen(id) {
  return patch(`/requests/${id}/seen`, {});
}

/**
 * PATCH /api/requests/:id/unread
 */
export async function markRequestUnread(id) {
  return patch(`/requests/${id}/unread`, {});
}

/**
 * PATCH /api/requests/:id/close  (multipart)
 * Closes a ticket with an optional note and file.
 */
export async function closeRequest(id, note = "", file = null) {
  const fd = new FormData();
  if (note) fd.append("note", note);
  if (file) fd.append("file", file);
  return patchForm(`/requests/${id}/close`, fd);
}