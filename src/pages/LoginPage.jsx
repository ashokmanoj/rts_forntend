import { useState } from "react";
import { login } from "../services/authService";
import { ChevronDown } from "lucide-react";

const DEMO_ACCOUNTS = [
  { label: "👤 Employee — Arjun Sharma",    email: "arjun@rts.com",                  role: "Employee" },
  { label: "👤 Employee — Priya Nair",      email: "priya@rts.com",                  role: "Employee" },
  { label: "📋 RM — Software",              email: "rm.software@rts.com",             role: "RM"       },
  { label: "📋 RM — Academic",              email: "rm.academic@rts.com",             role: "RM"       },
  { label: "🏛 HOD — Software",             email: "hod.software@rts.com",            role: "HOD"      },
  { label: "🏛 HOD — Academic",             email: "hod.academic@rts.com",            role: "HOD"      },
  { label: "🏢 Dept HOD — IT",              email: "itdepartment@rts.com",            role: "DeptHOD"  },
  { label: "🏢 Dept HOD — HR",              email: "hrdepartment@rts.com",            role: "DeptHOD"  },
  { label: "🏢 Dept HOD — Finance",         email: "financedepartment@rts.com",       role: "DeptHOD"  },
  { label: "🏢 Dept HOD — Technical",       email: "technicaldepartment@rts.com",     role: "DeptHOD"  },
  { label: "🏢 Dept HOD — Software",        email: "softwaredepartment@rts.com",      role: "DeptHOD"  },
  { label: "🏢 Dept HOD — Broadcasting",    email: "broadcastingdepartment@rts.com",  role: "DeptHOD"  },
  { label: "🏢 Dept HOD — Academic",        email: "academicdepartment@rts.com",      role: "DeptHOD"  },
  { label: "🔒 Admin",                      email: "admin@rts.com",                   role: "Admin"    },
];

const ROLE_COLOR = {
  Employee: "bg-indigo-50 text-indigo-700",
  RM:       "bg-blue-50 text-blue-700",
  HOD:      "bg-purple-50 text-purple-700",
  DeptHOD:  "bg-teal-50 text-teal-700",
  Admin:    "bg-orange-50 text-orange-700",
};

export default function LoginPage({ onLogin }) {
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      onLogin();
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (acc) => {
    setEmail(acc.email);
    setPassword("password123");
    setShowDemo(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-indigo-50 font-sans p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Main card */}
        <div className="bg-white shadow-2xl rounded-3xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 text-center">
            <h1 className="text-3xl font-black text-white tracking-tight">RTS SYSTEM</h1>
            <p className="text-indigo-200 text-sm mt-1 font-medium">Tele Education Portal</p>
          </div>

          <div className="p-8 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              />

              {error && (
                <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-xl">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* Demo accounts toggle */}
            <button
              onClick={() => setShowDemo((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm transition-colors"
            >
              <span>🧪 Demo Accounts</span>
              <ChevronDown size={16} className={`transition-transform ${showDemo ? "rotate-180" : ""}`} />
            </button>

            {showDemo && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => fillDemo(acc)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div>
                      <p className="font-bold text-slate-700 text-[12px]">{acc.label}</p>
                      <p className="text-slate-400 text-[10px] font-mono">{acc.email}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${ROLE_COLOR[acc.role]}`}>
                      {acc.role}
                    </span>
                  </button>
                ))}
                <div className="px-4 py-2 bg-slate-50 text-center">
                  <p className="text-[10px] text-slate-400 font-medium">
                    All passwords: <span className="font-black font-mono">password123</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Role legend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Role Access Guide</p>
          <div className="space-y-1.5 text-[11px]">
            {[
              { role: "Employee", color: "bg-indigo-100 text-indigo-700", desc: "Submit requests · Chat" },
              { role: "RM",       color: "bg-blue-100 text-blue-700",     desc: "Step 1: Approve / Reject / Check · Chat" },
              { role: "HOD",      color: "bg-purple-100 text-purple-700", desc: "Step 2: Approve / Reject / Check · Chat" },
              { role: "DeptHOD",  color: "bg-teal-100 text-teal-700",     desc: "Step 3: Approve · Close Ticket · Chat" },
              { role: "Admin",    color: "bg-orange-100 text-orange-700", desc: "Read-only · View all requests" },
            ].map(({ role, color, desc }) => (
              <div key={role} className="flex items-center gap-2">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full min-w-[72px] text-center ${color}`}>
                  {role}
                </span>
                <span className="text-slate-500">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}