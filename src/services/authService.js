/**
 * Auth Service
 * Handles login, logout, and reading the stored user from localStorage.
 */

import { post } from "./api";

const TOKEN_KEY = "rts_token";
const USER_KEY  = "rts_user";

/**
 * POST /api/auth/login
 * Stores JWT and user payload in localStorage on success.
 */
export async function login(email, password) {
  const data = await post("/auth/login", { email, password });
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

/**
 * Clears auth data from localStorage.
 */
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Returns true if a JWT is stored (does not verify expiry).
 */
export function isAuthenticated() {
  return !!localStorage.getItem(TOKEN_KEY);
}

/**
 * Returns the stored user object, or null if not logged in.
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}