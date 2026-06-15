import { get, patch } from "./api";

export async function fetchHodPendingRequests(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "" && v !== "all")
  ).toString();
  return get(qs ? `/requests/hod-pending?${qs}` : "/requests/hod-pending");
}

export async function submitHodApproval(id, decision, comment = "") {
  return patch(`/requests/${id}/hod-approval`, { decision, comment });
}
