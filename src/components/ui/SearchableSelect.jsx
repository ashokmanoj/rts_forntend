import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";

/**
 * Compact searchable dropdown — replaces all native <select> elements.
 *
 * Single-select (default):
 *   value:    string
 *   onChange: (newValue: string) => void
 *
 * Multi-select (multiSelect={true}):
 *   value:    string[]
 *   onChange: (newArray: string[]) => void
 *
 * options: string[]  OR  { value: string, label: string }[]
 */
export default function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select…",
  disabled = false,
  className = "",
  triggerClassName = "",
  multiSelect = false,
}) {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState("");
  const rootRef  = useRef(null);
  const inputRef = useRef(null);

  // Normalise to {value, label} regardless of input shape
  const normalised = options.map(o =>
    typeof o === "object" ? o : { value: String(o), label: String(o) }
  );

  // ── Label shown on the trigger button ──────────────────────────────────────
  const getTriggerLabel = () => {
    if (multiSelect) {
      const arr = Array.isArray(value) ? value : [];
      if (arr.length === 0) return placeholder;
      if (arr.length === 1) return normalised.find(o => o.value === arr[0])?.label ?? arr[0];
      return `${arr.length} selected`;
    }
    return normalised.find(o => o.value === value)?.label ?? (value || placeholder);
  };

  const hasValue = multiSelect ? (Array.isArray(value) && value.length > 0) : Boolean(value);

  const filtered = normalised.filter(o =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const close = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const handleSelect = (val) => {
    if (multiSelect) {
      const arr = Array.isArray(value) ? value : [];
      const next = arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
      onChange(next);
      // Stay open for multi-select
    } else {
      onChange(val);
      setOpen(false);
      setQuery("");
    }
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange(multiSelect ? [] : "");
    setQuery("");
  };

  const isSelected = (val) => {
    if (multiSelect) return Array.isArray(value) && value.includes(val);
    return value === val;
  };

  const defaultTrigger =
    "p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold hover:border-indigo-300";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {/* ── Trigger button ── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(p => !p)}
        className={`w-full flex items-center justify-between gap-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400
          ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
          ${triggerClassName || defaultTrigger}`}
      >
        <span className={`truncate flex-1 ${hasValue ? "text-slate-800" : "text-slate-400"}`}>
          {getTriggerLabel()}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {hasValue && (
            <span
              role="button"
              tabIndex={-1}
              onMouseDown={clearAll}
              className="text-slate-300 hover:text-red-400 transition-colors cursor-pointer"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown
            size={15}
            className={`text-slate-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div className="absolute z-[999] mt-1 w-full min-w-[160px] bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
          {/* Search bar */}
          <div className="p-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
              <Search size={12} className="shrink-0 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search…"
                className="flex-1 text-xs bg-transparent outline-none text-slate-700 placeholder-slate-400 min-w-0"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} className="shrink-0">
                  <X size={11} className="text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>
          </div>

          {/* Multi-select summary bar */}
          {multiSelect && Array.isArray(value) && value.length > 0 && (
            <div className="flex items-center justify-between px-3 py-1.5 bg-indigo-50 border-b border-indigo-100">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wide">
                {value.length} selected
              </span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[10px] font-black text-red-500 hover:text-red-700"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Options list — fixed height, scrollable */}
          <div className="overflow-y-auto max-h-44 py-1">
            {filtered.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center py-3">No results</p>
            ) : (
              filtered.map(opt => {
                const selected = isSelected(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center gap-2 text-left px-3 py-2 text-xs transition-colors
                      ${selected
                        ? "bg-indigo-50 text-indigo-700 font-black"
                        : "text-slate-700 font-medium hover:bg-indigo-50 hover:text-indigo-700"}`}
                  >
                    {multiSelect && (
                      <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors
                        ${selected ? "bg-indigo-600 border-indigo-600" : "border-slate-300"}`}>
                        {selected && <Check size={9} className="text-white" strokeWidth={3} />}
                      </span>
                    )}
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Done button for multi-select */}
          {multiSelect && (
            <div className="p-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setOpen(false); setQuery(""); }}
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
