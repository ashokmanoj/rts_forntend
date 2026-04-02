/**
 * App.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Root component — owns the auth state for the entire app.
 *
 * Startup flow:
 *   1. Check if a token exists in localStorage.
 *   2. If yes → call GET /api/auth/me to verify it's still valid.
 *   3. If the token is good → go straight to Dashboard (no flicker).
 *   4. If the token is missing or rejected → show Login page.
 *
 * Global 401 handling:
 *   api.js fires "rts:logout" on any 401 response mid-session.
 *   We listen for that event here and reset state to show Login.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from "react";
import { isAuthenticated, getStoredUser, logout } from "./services/authService";
import { get } from "./services/api";
import LoginPage     from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  const [isLoggedIn,  setIsLoggedIn]  = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [checking,    setChecking]    = useState(true); // Verifying token on startup

  // ── Verify stored token with backend on mount ─────────────────────────────
  useEffect(() => {
    if (!isAuthenticated()) {
      // No token at all → skip verification, show login immediately
      setChecking(false);
      return;
    }

    // Token exists in localStorage — verify it is still accepted by the backend
    get("/auth/me")
      .then((data) => {
        setCurrentUser(data.user);
        setIsLoggedIn(true);
      })
      .catch(() => {
        // Token was rejected (expired / revoked) → clear it and show login
        logout();
        setIsLoggedIn(false);
      })
      .finally(() => setChecking(false));
  }, []);

  // ── Listen for global 401 events fired by api.js ──────────────────────────
  // This handles token expiry that happens WHILE the user is using the app.
  useEffect(() => {
    const handleForceLogout = () => {
      setIsLoggedIn(false);
      setCurrentUser(null);
    };
    window.addEventListener("rts:logout", handleForceLogout);
    return () => window.removeEventListener("rts:logout", handleForceLogout);
  }, []);

  // ── Auth handlers ─────────────────────────────────────────────────────────
  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  // ── Startup splash (brief — only while /me call is in flight) ─────────────
  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-indigo-50 font-sans">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;
  return <DashboardPage currentUser={currentUser} onLogout={handleLogout} />;
}
