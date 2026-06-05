import { get, post, patch, del } from "./api";

export function fetchUserRoles(params = {}) {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.role)   q.set("role",   params.role);
  if (params.dept)   q.set("dept",   params.dept);
  const qs = q.toString();
  return get(`/admin/user-roles${qs ? `?${qs}` : ""}`);
}

export const addUserRole    = (empId, role, dept) => post("/admin/user-roles", { empId, role, dept });
export const updateUserRole = (id, role, dept)    => patch(`/admin/user-roles/${id}`, { role, dept });
export const deleteUserRole = (id)                => del(`/admin/user-roles/${id}`);
