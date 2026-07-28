import { useState } from "react";
import { Link } from "react-router-dom";
import { login, selectRole } from "../services/authService";
import {
  ShieldCheck, Eye, EyeOff,
  User, Users, Shield, Building2, Briefcase, Settings, Heart, UtensilsCrossed,
  ChevronRight, ChevronLeft, MapPin,
} from "lucide-react";
import InstructionsModal from "../components/modals/InstructionsModal";

const CATEGORY_CONFIG = {
  Requestor:     { label: "Requestor",          Icon: User,            bg: "bg-indigo-50",  iconBg: "bg-indigo-100",  text: "text-indigo-700",  border: "hover:border-indigo-400"  },
  RM:            { label: "Reporting Manager",   Icon: Users,           bg: "bg-violet-50",  iconBg: "bg-violet-100",  text: "text-violet-700",  border: "hover:border-violet-400"  },
  HOD:           { label: "Head of Department",  Icon: Shield,          bg: "bg-amber-50",   iconBg: "bg-amber-100",   text: "text-amber-700",   border: "hover:border-amber-400"   },
  DeptHOD:       { label: "Dept Login",            Icon: Building2,       bg: "bg-emerald-50", iconBg: "bg-emerald-100", text: "text-emerald-700", border: "hover:border-emerald-400" },
  Management:    { label: "Management",          Icon: Briefcase,       bg: "bg-sky-50",     iconBg: "bg-sky-100",     text: "text-sky-700",     border: "hover:border-sky-400"     },
  Admin:         { label: "Admin",               Icon: Settings,        bg: "bg-rose-50",    iconBg: "bg-rose-100",    text: "text-rose-700",    border: "hover:border-rose-400"    },
  HR:            { label: "HR",                  Icon: Heart,           bg: "bg-pink-50",    iconBg: "bg-pink-100",    text: "text-pink-700",    border: "hover:border-pink-400"    },
  FoodCommittee: { label: "Food Committee",      Icon: UtensilsCrossed, bg: "bg-orange-50",  iconBg: "bg-orange-100",  text: "text-orange-700",  border: "hover:border-orange-400"  },
  SuperUser:     { label: "Super User",          Icon: ShieldCheck,     bg: "bg-indigo-50",  iconBg: "bg-indigo-100",  text: "text-indigo-700",  border: "hover:border-indigo-400"  },
};

export default function LoginPage({ onLogin }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const [showPassword,      setShowPassword]      = useState(false);
  const [pending,           setPending]           = useState(null);
  const [selecting,         setSelecting]         = useState(false);
  const [selectedCategory,  setSelectedCategory]  = useState(null);
  const [showGuide,         setShowGuide]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (result?.needsRoleSelection) {
        setPending(result);
        setSelectedCategory(null);
      } else {
        window.location.replace("/");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = async (role, dept) => {
    setError("");
    setSelecting(true);
    try {
      await selectRole(pending.tempToken, role, dept);
      window.location.replace("/");
    } catch (err) {
      setError(err.response?.data?.error || "Role selection failed. Please try again.");
      setPending(null);
      setSelectedCategory(null);
    } finally {
      setSelecting(false);
    }
  };

  const handleBackToLogin = () => {
    setPending(null);
    setSelectedCategory(null);
    setError("");
  };

  // Unique role categories the user has
  const uniqueCategories = pending
    ? [...new Set(pending.availableRoles.map(r => r.role))]
    : [];

  // Depts for the selected category
  const categoryDepts = selectedCategory
    ? pending.availableRoles.filter(r => r.role === selectedCategory)
    : [];

  const subTitle = selectedCategory
    ? (CATEGORY_CONFIG[selectedCategory]?.label || selectedCategory)
    : pending
    ? "Select your active role"
    : "Tele Education Portal ( Internal Use Only )";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-indigo-50 font-sans p-4">

      {/* Help button */}
      <button
        onClick={() => setShowGuide(true)}
        title="Open Login User Guide"
        className="fixed top-6 right-6 z-50 h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center gap-2 text-[12px] font-black transition-all hover:scale-105 active:scale-95"
      >
        <ShieldCheck size={15} /> Login User Guide
      </button>

      {showGuide && (
        <InstructionsModal
          onClose={() => setShowGuide(false)}
          pdfSrc="/RTS-Login-Guide.pdf"
          downloadName="RTS-Login-Guide.pdf"
          title="Login & Account Access Guide"
          subtitle="Step-by-Step Visual Guide"
        />
      )}

      <div className="w-full max-w-md">
        <div className="bg-white shadow-2xl rounded-3xl border border-slate-200 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 sm:p-8 text-center">
            <h1 className="text-3xl font-black text-white tracking-tight">TELE-RTS</h1>
            <p className="text-indigo-200 text-sm mt-1 font-medium">{subTitle}</p>
          </div>

          <div className="p-5 sm:p-8 space-y-4">

            {/* ── Step 1: Category selection ──────────────────────────────── */}
            {pending && !selectedCategory && (
              <div className="space-y-3">
                <p className="text-slate-500 text-sm text-center">
                  Your account has multiple roles. Choose how you'd like to work today.
                </p>

                {uniqueCategories.map(role => {
                  const depts  = pending.availableRoles.filter(r => r.role === role);
                  const config = CATEGORY_CONFIG[role] || { label: role, Icon: User, bg: "bg-slate-50", iconBg: "bg-slate-100", text: "text-slate-700", border: "hover:border-slate-400" };
                  const multi  = depts.length > 1;

                  return (
                    <button
                      key={role}
                      onClick={() => multi ? setSelectedCategory(role) : handleSelectRole(role, depts[0].dept)}
                      disabled={selecting}
                      className={`w-full flex items-center gap-3 ${config.bg} border border-slate-200 ${config.border} rounded-2xl px-4 py-3.5 transition-all active:scale-[0.98] disabled:opacity-60 text-left`}
                    >
                      <div className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <config.Icon size={18} className={config.text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-black ${config.text}`}>{config.label}</p>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {multi ? `${depts.length} departments available` : depts[0].dept}
                        </p>
                      </div>
                      {multi && <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />}
                    </button>
                  );
                })}

                {error && (
                  <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-xl">{error}</p>
                )}
                <button
                  onClick={handleBackToLogin}
                  className="w-full text-slate-400 hover:text-slate-600 text-sm font-medium pt-1 transition-colors"
                >
                  ← Back to login
                </button>
              </div>
            )}

            {/* ── Step 2: Department selection within a category ───────────── */}
            {pending && selectedCategory && (
              <div className="space-y-3">
                {/* Back to categories */}
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 text-sm font-bold transition-colors"
                >
                  <ChevronLeft size={16} /> All Roles
                </button>

                <p className="text-slate-500 text-sm text-center">
                  Select a department for <span className="font-black text-slate-700">{CATEGORY_CONFIG[selectedCategory]?.label}</span>
                </p>

                {categoryDepts.map(({ dept }) => {
                  const config = CATEGORY_CONFIG[selectedCategory] || {};
                  return (
                    <button
                      key={dept}
                      onClick={() => handleSelectRole(selectedCategory, dept)}
                      disabled={selecting}
                      className={`w-full flex items-center gap-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-400 rounded-2xl px-4 py-3.5 transition-all active:scale-[0.98] disabled:opacity-60 text-left`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <MapPin size={15} className="text-indigo-400" />
                      </div>
                      <span className="text-sm font-black text-slate-700">{dept}</span>
                      {selecting && <span className="ml-auto w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />}
                    </button>
                  );
                })}

                {error && (
                  <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-xl">{error}</p>
                )}
                <button
                  onClick={handleBackToLogin}
                  className="w-full text-slate-400 hover:text-slate-600 text-sm font-medium pt-1 transition-colors"
                >
                  ← Back to login
                </button>
              </div>
            )}

            {/* ── Login form ───────────────────────────────────────────────── */}
            {!pending && (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text" placeholder="Enter factohr email address" value={email}
                  onChange={(e) => setEmail(e.target.value)} required
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password" value={password}
                    onChange={(e) => setPassword(e.target.value)} required
                    className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {error && (
                  <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-xl">{error}</p>
                )}
                <button type="submit" disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95">
                  {loading ? "Logging in..." : "Login"}
                </button>
                <div className="text-center">
                  <Link
                    to="/forgot-password"
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
