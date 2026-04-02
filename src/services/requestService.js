/**
 * services/requestService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Maps frontend actions to backend /api/requests endpoints.
 *
 * FIX: createRequest now sends `assignedDept` instead of `dept`.
 *   - `dept` (requestor's own department) is always set by the backend
 *     from the JWT token — the frontend never needs to send it.
 *   - `assignedDept` is which department should HANDLE the request.
 *     If not provided, backend defaults it to the user's own department.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { get, postForm, patch, patchForm } from "./api";

/** GET /api/requests — returns role-filtered list. */
export async function fetchRequests() {
  return get("/requests");
}

/**
 * POST /api/requests — create a new request (multipart).
 * @param {object} params
 * @param {string} params.purpose      - Request title (required)
 * @param {string} params.assignedDept - Which dept handles it (optional, defaults to user's dept)
 * @param {string} params.description  - Detailed description (optional)
 * @param {File}   params.file         - Attachment (optional)
 */
export async function createRequest({ purpose, assignedDept, description, file }) {
  const fd = new FormData();
  fd.append("purpose", purpose);
  // Send as assignedDept — backend ignores body.dept and uses JWT for request.dept
  if (assignedDept) fd.append("assignedDept", assignedDept);
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

/** PATCH /api/requests/:id/seen */
export async function markRequestSeen(id) {
  return patch(`/requests/${id}/seen`, {});
}

/** PATCH /api/requests/:id/unread */
export async function markRequestUnread(id) {
  return patch(`/requests/${id}/unread`, {});
}

/** PATCH /api/requests/:id/close (multipart — optional note + file). */
export async function closeRequest(id, note = "", file = null) {
  const fd = new FormData();
  if (note) fd.append("note", note);
  if (file) fd.append("file", file);
  return patchForm(`/requests/${id}/close`, fd);
}
