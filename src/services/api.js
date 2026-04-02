/**
 * services/api.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Base HTTP utility used by all service modules.
 *
 * - Automatically attaches the Bearer JWT stored in localStorage.
 * - On any 401 response, fires "rts:logout" so App.jsx can redirect to login.
 * - On network failure (server down), throws a user-friendly error.
 *
 * VITE_API_URL in .env:
 *   Development  → /api   (Vite proxy forwards to localhost:5000)
 *   Production   → https://your-backend.com/api
 * ─────────────────────────────────────────────────────────────────────────────
 */

const BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

// ── Token helpers ─────────────────────────────────────────────────────────────
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

// ── Global 401 handler ────────────────────────────────────────────────────────
// Any 401 (expired / revoked token) fires "rts:logout" so App.jsx can
// clear state and return to the login page automatically.
function handleUnauthorized() {
  localStorage.removeItem("rts_token");
  localStorage.removeItem("rts_user");
  window.dispatchEvent(new Event("rts:logout"));
}

// ── Response handler ──────────────────────────────────────────────────────────
async function handleResponse(res) {
  if (res.status === 401) {
    handleUnauthorized();
    throw Object.assign(new Error("Session expired. Please log in again."), {
      response: { status: 401, data: {} },
    });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(data?.error || `HTTP ${res.status}`), {
      response: { status: res.status, data },
    });
  }
  return data;
}

// ── Network-safe fetch ────────────────────────────────────────────────────────
// Wraps fetch so a downed server produces a clear message instead of a raw
// TypeError ("Failed to fetch").
async function safeFetch(url, options) {
  try {
    return await fetch(url, options);
  } catch {
    throw Object.assign(
      new Error("Cannot reach the server. Is the backend running?"),
      { response: { status: 0, data: {} } }
    );
  }
}

// ── HTTP methods ──────────────────────────────────────────────────────────────

export async function get(path) {
  const res = await safeFetch(`${BASE_URL}${path}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function post(path, body) {
  const res = await safeFetch(`${BASE_URL}${path}`, {
    method:  "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body:    JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function postForm(path, formData) {
  // Do NOT set Content-Type — the browser sets it with the multipart boundary.
  const res = await safeFetch(`${BASE_URL}${path}`, {
    method:  "POST",
    headers: authHeaders(),
    body:    formData,
  });
  return handleResponse(res);
}

export async function patch(path, body) {
  const res = await safeFetch(`${BASE_URL}${path}`, {
    method:  "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body:    JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function patchForm(path, formData) {
  const res = await safeFetch(`${BASE_URL}${path}`, {
    method:  "PATCH",
    headers: authHeaders(),
    body:    formData,
  });
  return handleResponse(res);
}
