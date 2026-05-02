/**
 * App.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Root component — owns the auth state and global routing.
 * Now includes heartbeat logic to track usage hours.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, logout as clearStorage, switchRole as switchRoleService } from "./services/authService";
import { get, post } from "./services/api";
import LoginPage            from "./pages/LoginPage";
import ForgotPasswordPage   from "./pages/ForgotPasswordPage";
import ResetPasswordPage    from "./pages/ResetPasswordPage";
import DashboardPage        from "./pages/DashboardPage";
import AdminReportPage      from "./pages/AdminReportPage";
import ManagementPortal     from "./pages/ManagementPortal";

export default function App() {
  const [isLoggedIn,  setIsLoggedIn]  = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [checking,    setChecking]    = useState(true);
  const location = useLocation();

  // ── Verify session on mount ───────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated()) {
      setChecking(false);
      return;
    }

    get("/auth/me")
      .then((data) => {
        setCurrentUser(data.user);
        setIsLoggedIn(true);
      })
      .catch(() => {
        handleLogout();
      })
      .finally(() => setChecking(false));
  }, []);

  // ── Heartbeat Mechanism ───────────────────────────────────────────────────
  // Updates 'lastSeen' and current session duration every 2 minutes.
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      post("/auth/heartbeat", {}).catch(() => {});
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // ── Global 401 listener ───────────────────────────────────────────────────
  useEffect(() => {
    const handleForceLogout = () => {
      setIsLoggedIn(false);
      setCurrentUser(null);
    };
    window.addEventListener("rts:logout", handleForceLogout);
    return () => window.removeEventListener("rts:logout", handleForceLogout);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleSwitchRole = async (role, dept) => {
    const user = await switchRoleService(role, dept);
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    // Clear local state first so heartbeat stops and token stays intact for the API call
    const wasLoggedIn = isLoggedIn;
    clearStorage();
    setCurrentUser(null);
    setIsLoggedIn(false);
    if (wasLoggedIn) {
      try { await post("/auth/logout", {}); } catch (e) {}
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Routing ───────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/login"                element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/forgot-password"      element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="*"                     element={<Navigate to="/login" replace state={{ from: location }} />} />
      </Routes>
    );
  }

  const isManagement = currentUser?.role === "Management";

  // Management users are routed to their dedicated portal by default.
  if (isManagement) {
    return (
      <Routes>
        <Route path="/management" element={
          <ManagementPortal currentUser={currentUser} onLogout={handleLogout} />
        } />
        {/* Admin report still accessible to Management */}
        <Route path="/admin/report" element={<AdminReportPage />} />
        {/* Any other path → management portal */}
        <Route path="*" element={<Navigate to="/management" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <DashboardPage currentUser={currentUser} onLogout={handleLogout} onSwitchRole={handleSwitchRole} />
      } />

      {/* Admin Protected Route */}
      <Route path="/admin/report" element={
        currentUser?.role === "Admin"
          ? <AdminReportPage />
          : <Navigate to="/" replace />
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
