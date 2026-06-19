import { ExternalLink } from "lucide-react";

/** Splits text on URLs and renders each URL as a clickable <a> tag. */
export function renderWithLinks(text) {
  if (!text) return null;
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer"
           className="text-blue-500 underline break-all hover:text-blue-700 inline-flex items-center gap-0.5">
          {part}<ExternalLink size={9} className="flex-shrink-0 inline ml-0.5"/>
        </a>
      : <span key={i}>{part}</span>
  );
}

/** Returns true if the string contains at least one http/https URL. */
export function hasLinks(text) {
  return /https?:\/\/[^\s]+/.test(text || "");
}

/**
 * Drop-in live "Link Preview" panel shown below a textarea.
 * Renders nothing when no URLs are present.
 */
export function LinkPreview({ text }) {
  if (!hasLinks(text)) return null;
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
      <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest mb-1">Link Preview</p>
      <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap break-words">
        {renderWithLinks(text)}
      </p>
    </div>
  );
}
