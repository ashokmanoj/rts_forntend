import { useEffect, useState } from "react";

export default function AppLoader() {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut]   = useState(false);

  useEffect(() => {
    // Simulate YouTube-style progress bar — fast at start, slows near end
    const steps = [
      { target: 30,  delay: 80  },
      { target: 55,  delay: 150 },
      { target: 72,  delay: 250 },
      { target: 85,  delay: 400 },
      { target: 94,  delay: 600 },
    ];

    let timeout;
    steps.forEach(({ target, delay }) => {
      timeout = setTimeout(() => setProgress(target), delay);
    });

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      {/* YouTube-style top progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-slate-100">
        <div
          className="h-full bg-indigo-500 rounded-r-full transition-all ease-out"
          style={{
            width: `${progress}%`,
            transitionDuration: progress < 30 ? "80ms" : progress < 72 ? "300ms" : "700ms",
            boxShadow: "0 0 8px rgba(99,102,241,0.6)",
          }}
        />
      </div>

      {/* Logo + name */}
      <div className="flex flex-col items-center gap-4 animate-[logoIn_0.5s_ease-out_both]">
        <div className="relative">
          <img
            src="/rtsLogo.png"
            alt="RTS"
            className="w-20 h-20 object-contain drop-shadow-lg"
          />
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full animate-ping bg-indigo-100 opacity-40" style={{ animationDuration: "1.8s" }} />
        </div>

        <div className="text-center space-y-1">
          <p className="text-xl font-black tracking-tight text-slate-800">RTS</p>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Request Tracking System</p>
        </div>
      </div>

      {/* Skeleton dashboard preview */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 space-y-2.5 opacity-40">
        {[100, 85, 92, 70].map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse flex-shrink-0" style={{ animationDelay: `${i * 80}ms` }} />
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 rounded-full bg-slate-200 animate-pulse" style={{ width: `${w}%`, animationDelay: `${i * 80}ms` }} />
              <div className="h-2 rounded-full bg-slate-100 animate-pulse" style={{ width: `${w * 0.6}%`, animationDelay: `${i * 80 + 100}ms` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom brand line */}
      <p className="absolute bottom-5 text-[10px] text-slate-300 font-medium tracking-widest uppercase">
        Loading your workspace…
      </p>
    </div>
  );
}
