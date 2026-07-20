"use strict";

/**
 * Allowlist-based HTML sanitizer.
 * Only keeps safe formatting tags; strips scripts, event handlers, and dangerous hrefs.
 */
const SAFE_TAGS = new Set([
  "b", "strong", "i", "em", "u", "mark",
  "ul", "ol", "li", "br", "p", "div", "span", "a",
  // Table tags
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col",
]);

const TABLE_CELL_TAGS = new Set(["td", "th"]);

export function sanitizeHtml(html) {
  if (!html) return "";
  const wrap = document.createElement("div");
  wrap.innerHTML = html;
  cleanNode(wrap);
  linkifyTextNodes(wrap);
  return wrap.innerHTML;
}

function cleanNode(node) {
  for (const child of [...node.childNodes]) {
    if (child.nodeType === 8) { child.remove(); continue; } // comments
    if (child.nodeType !== 1) continue;                     // text nodes are fine

    const tag = child.tagName.toLowerCase();
    if (!SAFE_TAGS.has(tag)) {
      // Unwrap: lift children out, remove the element
      while (child.firstChild) node.insertBefore(child.firstChild, child);
      child.remove();
      continue;
    }

    // Strip event-handler attributes only
    for (const attr of [...child.attributes]) {
      if (/^on/i.test(attr.name)) child.removeAttribute(attr.name);
    }
    // Validate <a> hrefs
    if (tag === "a") {
      const href = child.getAttribute("href") || "";
      if (!/^https?:\/\//i.test(href)) child.removeAttribute("href");
      child.setAttribute("target", "_blank");
      child.setAttribute("rel", "noopener noreferrer");
    }
    cleanNode(child);
  }
}

/** Walk text nodes and wrap bare URLs in <a> tags (skips existing <a> elements). */
function linkifyTextNodes(node) {
  const URL_RE = /(https?:\/\/[^\s<>"']+)/g;
  for (const child of [...node.childNodes]) {
    if (child.nodeType === 3) {
      const text = child.textContent;
      URL_RE.lastIndex = 0;
      if (!URL_RE.test(text)) continue;
      URL_RE.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let last = 0, m;
      while ((m = URL_RE.exec(text)) !== null) {
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        const a = document.createElement("a");
        a.href = m[0];
        a.textContent = m[0];
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        frag.appendChild(a);
        last = m.index + m[0].length;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.replaceChild(frag, child);
    } else if (child.nodeType === 1 && child.tagName.toLowerCase() !== "a") {
      linkifyTextNodes(child);
    }
  }
}

/** Strip all HTML tags, returning plain text. */
export function stripHtml(html) {
  if (!html) return "";
  const d = document.createElement("div");
  d.innerHTML = html;
  return d.textContent || d.innerText || "";
}

/** True if the string contains HTML tags or encoded HTML entities. */
export function isHtmlContent(text) {
  if (!text) return false;
  return /<[a-z][\s\S]*>/i.test(text) || /&(nbsp|amp|lt|gt|quot|apos);/.test(text);
}

/**
 * Paste sanitizer — like sanitizeHtml but strips most attributes.
 * Preserves colspan/rowspan on table cells; strips everything else
 * (Gmail/Google Docs metadata: jsslot, data-path-to-node, style, class, etc.)
 */
export function sanitizePaste(html) {
  if (!html) return "";
  const wrap = document.createElement("div");
  wrap.innerHTML = html;
  cleanPasteNode(wrap);
  return wrap.innerHTML;
}

// Tags whose entire subtree must be dropped (not unwrapped) on paste.
// <style>/<script> contain text that would leak as visible content if unwrapped.
// <img>/<svg>/<object>/<embed> embed media we don't want in form fields.
const REMOVE_ENTIRELY = new Set([
  "style", "script", "link", "meta", "title", "head",
  "img", "svg", "picture", "video", "audio", "object", "embed", "iframe",
]);

function cleanPasteNode(node) {
  for (const child of [...node.childNodes]) {
    if (child.nodeType === 8) { child.remove(); continue; } // strip comments
    if (child.nodeType !== 1) continue;                     // leave text nodes

    const tag = child.tagName.toLowerCase();

    // Remove the element AND all its children — no content salvaged
    if (REMOVE_ENTIRELY.has(tag)) {
      child.remove();
      continue;
    }

    if (!SAFE_TAGS.has(tag)) {
      // Unwrap — lift content out, discard the tag
      while (child.firstChild) node.insertBefore(child.firstChild, child);
      child.remove();
      continue;
    }
    // Strip every attribute except colspan/rowspan on table cells
    for (const attr of [...child.attributes]) {
      if (TABLE_CELL_TAGS.has(tag) && (attr.name === "colspan" || attr.name === "rowspan")) continue;
      child.removeAttribute(attr.name);
    }
    // Restore safe anchor attributes
    if (tag === "a") {
      const href = child.getAttribute("href") || "";
      if (!/^https?:\/\//i.test(href)) child.removeAttribute("href");
      else {
        child.setAttribute("target", "_blank");
        child.setAttribute("rel", "noopener noreferrer");
      }
    }
    cleanPasteNode(child);
  }
}

/**
 * Convert tab-separated-value text to an HTML table string.
 * Returns null if the text doesn't look like tabular data
 * (needs ≥2 rows and ≥2 columns).
 */
export function tsvToHtmlTable(text) {
  if (!text) return null;
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim() !== "");
  if (lines.length < 2) return null;

  const rows = lines.map(l => l.split("\t"));
  const maxCols = Math.max(...rows.map(r => r.length));
  if (maxCols < 2) return null;

  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const [headerRow, ...bodyRows] = rows;
  const ths = headerRow.map(c => `<th>${esc(c.trim())}</th>`).join("");
  const trs = bodyRows.map(row => {
    const tds = Array.from({ length: maxCols }, (_, i) => `<td>${esc((row[i] ?? "").trim())}</td>`).join("");
    return `<tr>${tds}</tr>`;
  }).join("");

  return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
}
