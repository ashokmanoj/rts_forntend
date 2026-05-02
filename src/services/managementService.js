import { get, patch } from "./api";

export async function fetchHodPendingRequests() {
  return get("/requests/hod-pending");
}

export async function submitHodApproval(id, decision, comment = "") {
  return patch(`/requests/${id}/hod-approval`, { decision, comment });
}
