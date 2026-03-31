/**
 * Base API utility — all requests go through here.
 * Automatically attaches the JWT from localStorage.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("rts_token");
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error || `HTTP ${res.status}`);
    err.response = { status: res.status, data };
    throw err;
  }
  return data;
}

export async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function postForm(path, formData) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders(), // No Content-Type — browser sets multipart boundary
    body: formData,
  });
  return handleResponse(res);
}

export async function patch(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function patchForm(path, formData) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: formData,
  });
  return handleResponse(res);
}