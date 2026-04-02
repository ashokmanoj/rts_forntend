/**
 * pages/LoginPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Full login page with:
 *   - Email + password form
 *   - Real API call via authService.login()
 *   - Demo accounts dropdown (all 18 dept HODs + sample requestors/roles)
 *   - Role access legend
 *
 * Props:
 *   onLogin(user) — called after successful login with the JWT user payload
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { login }    from "../services/authService";
import { ChevronDown } from "lucide-react";

// ── Demo accounts — covers all roles for quick testing ───────────────────────
const DEMO_ACCOUNTS = [
  // Requestors
  { label: "👤 Requestor — Santhosh S M",          email: "santhosh.sm9@gmail.com",         role: "Requestor" },
  { label: "👤 Requestor — Divya H M",             email: "divyahmmahadev1998@gmail.com",   role: "Requestor" },
  // RMs
  { label: "📋 RM — Anil Kumar G (Academic)",     email: "kadakkath@gmail.com",            role: "RM"       },
  { label: "📋 RM — Rahul Subba (Tech Support)",  email: "rhlsubba19@gmail.com",           role: "RM"       },
  { label: "📋 RM — Pavan Verma (Purchase)",      email: "pvnverma77@gmail.com",           role: "RM"       },
  // HODs
  { label: "🏛 HOD — Raveendra Bhat (Academic)",  email: "bhatraveendrabeegar@gmail.com",  role: "HOD"      },
  { label: "🏛 HOD — Pruthvi Raj R (Animation)",  email: "pruthvi2k7@gmail.com",           role: "HOD"      },
  { label: "🏛 HOD — Manjunatha (Operation)",     email: "manjumsw75@gmail.com",           role: "HOD"      },
  // DeptHODs (email = dept@rts.com, password = Dept@123)
  { label: "🏢 DeptHOD — Academic",              email: "academic@rts.com",               role: "DeptHOD"  },
  { label: "🏢 DeptHOD — Software",              email: "software@rts.com",               role: "DeptHOD"  },
  { label: "🏢 DeptHOD — Operation",             email: "operation@rts.com",              role: "DeptHOD"  },
  { label: "🏢 DeptHOD — Animation",             email: "animation@rts.com",              role: "DeptHOD"  },
  { label: "🏢 DeptHOD — HR",                    email: "hr@rts.com",                     role: "DeptHOD"  },
  { label: "🏢 DeptHOD — Accounts",              email: "accounts@rts.com",               role: "DeptHOD"  },
  { label: "🏢 DeptHOD — Broadcasting",          email: "broadcasting@rts.com",           role: "DeptHOD"  },
  { label: "🏢 DeptHOD — Technical Support",     email: "technicalsupport@rts.com",       role: "DeptHOD"  },
  // Admin
  { label: "🔒 Admin — System Admin",            email: "admin@rts.com",                  role: "Admin"    },
];

const ROLE_COLOR = {
  Requestor: "bg-indigo-50 text-indigo-700",
  RM:       "bg-blue-50   text-blue-700",
  HOD:      "bg-purple-50 text-purple-700",
  DeptHOD:  "bg-teal-50   text-teal-700",
  Admin:    "bg-orange-50 text-orange-700",
};

// Default password hint per role (for the demo helper text)
function defaultPassword(role, email) {
  if (role === "DeptHOD") {
    // Dept@123 — capitalise first letter of the dept part before @
    const dept = email.split("@")[0];
    return dept.charAt(0).toUpperCase() + dept.slice(1) + "@123";
  }
  if (role === "Admin") return "Admin@123";
  return "FirstName@123";
}

export default function LoginPage({ onLogin }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      onLogin(user);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Fill email and auto-derive password for demo accounts
  const fillDemo = (acc) => {
    setEmail(acc.email);
    setPassword(defaultPassword(acc.role, acc.email));
    setShowDemo(false);
    setError("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-indigo-50 font-sans p-4">
      <div className="w-full max-w-md space-y-4">

        {/* ── Main card ─────────────────────────────────────────────────── */}
        <div className="bg-white shadow-2xl rounded-3xl border border-slate-200 overflow-hidden">

          {/* Header banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 text-center">
            <h1 className="text-3xl font-black text-white tracking-tight">RTS SYSTEM</h1>
            <p className="text-indigo-200 text-sm mt-1 font-medium">Tele Education Portal</p>
          </div>

          <div className="p-8 space-y-4">

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-72 overflow-y-auto">
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
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${ROLE_COLOR[acc.role]}`}>
                      {acc.role}
                    </span>
                  </button>
                ))}

                {/* Password hint footer */}
                <div className="px-4 py-2.5 bg-slate-50 text-[10px] text-slate-500 space-y-0.5">
                  <p>Requestor / RM / HOD → <span className="font-mono font-black">FirstName@123</span></p>
                  <p>DeptHOD → <span className="font-mono font-black">Dept@123</span>  (e.g. Software@123)</p>
                  <p>Admin   → <span className="font-mono font-black">Admin@123</span></p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Role legend ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Role Access Guide</p>
          <div className="space-y-1.5 text-[11px]">
            {[
              { role: "Requestor", color: "bg-indigo-100 text-indigo-700", desc: "Submit requests · Chat" },
              { role: "RM",       color: "bg-blue-100   text-blue-700",   desc: "Step 1: Approve / Reject / Check / Forward" },
              { role: "HOD",      color: "bg-purple-100 text-purple-700", desc: "Step 2: Approve / Reject / Check / Forward" },
              { role: "DeptHOD",  color: "bg-teal-100   text-teal-700",   desc: "Step 3: Approve · Close Ticket · Chat" },
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
