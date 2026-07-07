import { ExternalLink } from "lucide-react";

// Parse inline markers: **bold**, __underline__, ==highlight==, URLs
function parseInline(text, keyPrefix) {
  const RE = /(\*\*(.+?)\*\*|__(.+?)__|==(.+?)==|(https?:\/\/[^\s]+))/g;
  const nodes = [];
  let last = 0;
  let m;
  let i = 0;

  while ((m = RE.exec(text)) !== null) {
    if (m.index > last) {
      nodes.push(<span key={`${keyPrefix}_t${i++}`}>{text.slice(last, m.index)}</span>);
    }
    const tok = m[0];
    if (tok.startsWith("**")) {
      nodes.push(<strong key={`${keyPrefix}_b${i++}`}>{m[2]}</strong>);
    } else if (tok.startsWith("__")) {
      nodes.push(<u key={`${keyPrefix}_u${i++}`}>{m[3]}</u>);
    } else if (tok.startsWith("==")) {
      nodes.push(
        <mark key={`${keyPrefix}_h${i++}`} className="bg-yellow-200 rounded-sm px-0.5">{m[4]}</mark>
      );
    } else {
      nodes.push(
        <a key={`${keyPrefix}_l${i++}`} href={tok} target="_blank" rel="noopener noreferrer"
           className="text-blue-500 underline break-all hover:text-blue-700 inline-flex items-center gap-0.5">
          {tok}<ExternalLink size={9} className="flex-shrink-0 inline ml-0.5" />
        </a>
      );
    }
    last = m.index + tok.length;
  }

  if (last < text.length) {
    nodes.push(<span key={`${keyPrefix}_t${i++}`}>{text.slice(last)}</span>);
  }
  return nodes.length === 0 ? null : nodes.length === 1 ? nodes[0] : nodes;
}

/**
 * Renders a plain-text string with rich formatting markers into React nodes.
 * Supports: **bold**, __underline__, ==highlight==, - bullet lists, URLs.
 */
export function renderRichText(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("- ") || line.startsWith("* ")) {
      // Collect consecutive bullet lines into a <ul>
      const bullets = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        bullets.push(lines[i].slice(2));
        i++;
      }
      result.push(
        <ul key={`ul${i}`} className="list-disc list-inside my-0.5 space-y-0">
          {bullets.map((b, j) => (
            <li key={j} className="leading-relaxed">{parseInline(b, `ul${i}_${j}`) ?? ""}</li>
          ))}
        </ul>
      );
    } else {
      if (result.length > 0) result.push(<br key={`br${i}`} />);
      result.push(
        <span key={`ln${i}`}>{parseInline(line, `ln${i}`) ?? ""}</span>
      );
      i++;
    }
  }
  return result;
}

/** Apply a format type to selected text in a textarea element. */
export function applyFormat(textareaEl, type, value, onChange) {
  const s = textareaEl.selectionStart;
  const e = textareaEl.selectionEnd;
  const selected = value.slice(s, e);

  let newValue, newSel;

  if (type === "bullet") {
    // Expand to full lines
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    const lineEndRaw = value.indexOf("\n", e);
    const lineEnd = lineEndRaw === -1 ? value.length : lineEndRaw;
    const block = value.slice(lineStart, lineEnd);
    const blockLines = block.split("\n");
    const allBulleted = blockLines.every((l) => l.startsWith("- "));
    const newLines = allBulleted
      ? blockLines.map((l) => (l.startsWith("- ") ? l.slice(2) : l))
      : blockLines.map((l) => (l.startsWith("- ") ? l : "- " + l));
    const newBlock = newLines.join("\n");
    newValue = value.slice(0, lineStart) + newBlock + value.slice(lineEnd);
    newSel = [lineStart, lineStart + newBlock.length];
  } else {
    const markers = { bold: "**", underline: "__", highlight: "==" };
    const m = markers[type];
    if (selected.startsWith(m) && selected.endsWith(m) && selected.length > m.length * 2) {
      const inner = selected.slice(m.length, -m.length);
      newValue = value.slice(0, s) + inner + value.slice(e);
      newSel = [s, s + inner.length];
    } else {
      const wrapped = `${m}${selected}${m}`;
      newValue = value.slice(0, s) + wrapped + value.slice(e);
      newSel = selected ? [s, s + wrapped.length] : [s + m.length, s + m.length];
    }
  }

  onChange({ target: { value: newValue } });
  requestAnimationFrame(() => {
    textareaEl.focus();
    textareaEl.setSelectionRange(newSel[0], newSel[1]);
  });
}
