import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import { isAuthenticated, logout } from "./services/authService";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;
  return <DashboardPage onLogout={handleLogout} />;
}