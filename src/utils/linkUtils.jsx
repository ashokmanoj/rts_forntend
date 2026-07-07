import { ExternalLink } from "lucide-react";

/** Splits plain text on URLs and renders each URL as a clickable <a> tag. */
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

/** No-op preview — kept for import compat; WYSIWYG editor shows formatting inline. */
export function LinkPreview() {
  return null;
}
