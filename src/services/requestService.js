import { get, postForm, patch, patchForm, del } from "./api";

export async function fetchRequests(params = {}) {
  const query = new URLSearchParams();
  Object.keys(params).forEach(key => {
    const val = params[key];
    if (!val) return;
    if (val instanceof Date) {
      query.set(key, val.toISOString().split("T")[0]); // YYYY-MM-DD
    } else {
      query.set(key, val);
    }
  });
  const qs = query.toString();
  return get(`/requests${qs ? `?${qs}` : ""}`);
}

export async function fetchFilterOptions() {
  return get("/requests/filters");
}

export async function createRequest({ purpose, assignedDept, assignedDepts, description, files, dueDate, assignedPersonEmpId, assignedPersonName }) {
  const fd = new FormData();
  fd.append("purpose", purpose);
  if (assignedDept)  fd.append("assignedDept",  assignedDept);
  if (assignedDepts) fd.append("assignedDepts", assignedDepts);
  fd.append("description", description || "");
  if (files?.length) files.forEach(f => fd.append("files", f));
  if (dueDate) fd.append("dueDate", dueDate);
  if (assignedPersonEmpId) fd.append("assignedPersonEmpId", assignedPersonEmpId);
  if (assignedPersonName)  fd.append("assignedPersonName",  assignedPersonName);
  return postForm("/requests", fd);
}

export async function submitApproval(id, decision, comment = "", newDept = "", checkingDeadline = null, checkingReason = null, extras = {}) {
  return patch(`/requests/${id}/approval`, { decision, comment, newDept, checkingDeadline, checkingReason, ...extras });
}

export async function acknowledgeRequest(id, status) {
  return patch(`/requests/${id}/acknowledge`, { status });
}
export async function markRequestSeen(id)   { return patch(`/requests/${id}/seen`, {}); }
export async function markRequestUnread(id) { return patch(`/requests/${id}/unread`, {}); }

export async function closeRequest(id, note = "", file = null) {
  const fd = new FormData();
  if (note) fd.append("note", note);
  if (file) fd.append("file", file);
  return patchForm(`/requests/${id}/close`, fd);
}

export async function editRequest(id, data) {
  return patch(`/requests/${id}/edit`, data);
}

export async function deleteRequest(id) {
  return del(`/requests/${id}`);
}
