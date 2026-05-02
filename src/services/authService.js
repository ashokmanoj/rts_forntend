/**
 * services/authService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Login, logout, and reading the stored user from localStorage.
 *
 * IMPORTANT — isAuthenticated() only checks whether a token STRING exists.
 * It does NOT verify the token against the backend.
 * App.jsx calls GET /api/auth/me on startup to do that validation.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { post, postWithToken } from "./api";

const TOKEN_KEY = "rts_token";
const USER_KEY  = "rts_user";

/**
 * POST /api/auth/login
 * - Single-role users: stores JWT + user, returns user object.
 * - Multi-role users: returns { needsRoleSelection, tempToken, availableRoles }
 *   without touching localStorage (no token yet).
 */
export async function login(email, password) {
  const data = await post("/auth/login", { email, password });
  if (data.needsRoleSelection) return data;
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

/**
 * POST /api/auth/select-role  (uses temp token, not localStorage token)
 * Called after login when the user picks a role from the selection screen.
 */
export async function selectRole(tempToken, role, dept) {
  const data = await postWithToken("/auth/select-role", { role, dept }, tempToken);
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

/**
 * POST /api/auth/switch-role  (uses current full JWT from localStorage)
 * Called when an already-logged-in user wants to switch their active role.
 */
export async function switchRole(role, dept) {
  const data = await post("/auth/switch-role", { role, dept });
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

/** Removes auth data from localStorage. */
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** Returns true only if a token string is stored locally. */
export function isAuthenticated() {
  return !!localStorage.getItem(TOKEN_KEY);
}

/** POST /api/auth/forgot-password */
export async function forgotPassword(email) {
  return post("/auth/forgot-password", { email });
}

/** POST /api/auth/reset-password/:token */
export async function resetPassword(token, password) {
  return post(`/auth/reset-password/${token}`, { password });
}

/** Returns the cached user object, or null if not logged in. */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
