import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/authService";
import { ArrowLeft, KeyRound, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const { token }   = useParams();
  const navigate    = useNavigate();

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      return setError("Password must be at least 8 characters.");
    }
    if (password !== confirm) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-indigo-50 font-sans p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-2xl rounded-3xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 text-center">
            <h1 className="text-3xl font-black text-white tracking-tight">RTS SYSTEM</h1>
            <p className="text-indigo-200 text-sm mt-1 font-medium">Set New Password</p>
          </div>

          <div className="p-8 space-y-5">
            {success ? (
              <div className="text-center space-y-4 py-2">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={30} className="text-green-600" />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-[15px]">Password updated!</p>
                  <p className="text-slate-500 text-sm mt-1">
                    Your password has been reset. Redirecting you to login…
                  </p>
                </div>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition-colors"
                >
                  <ArrowLeft size={14} /> Go to login now
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <KeyRound size={22} className="text-indigo-600" />
                  </div>
                  <p className="font-black text-slate-800 text-[15px]">Choose a new password</p>
                  <p className="text-slate-500 text-sm">Must be at least 8 characters.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      placeholder="New password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  />
                  {error && (
                    <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-xl">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95"
                  >
                    {loading ? "Resetting…" : "Reset Password"}
                  </button>
                </form>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm font-semibold transition-colors"
                  >
                    <ArrowLeft size={14} /> Back to login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
