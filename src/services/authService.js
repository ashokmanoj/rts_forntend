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

import { post } from "./api";

const TOKEN_KEY = "rts_token";
const USER_KEY  = "rts_user";

/**
 * POST /api/auth/login
 * Stores the JWT and user payload in localStorage on success.
 * Returns the user object so App.jsx can set state immediately.
 */
export async function login(email, password) {
  const data = await post("/auth/login", { email, password });
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

/** Returns the cached user object, or null if not logged in. */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
