"use strict";

/**
 * Allowlist-based HTML sanitizer.
 * Only keeps safe formatting tags; strips scripts, event handlers, and dangerous hrefs.
 */
const SAFE_TAGS = new Set([
  "b", "strong", "i", "em", "u", "mark",
  "ul", "ol", "li", "br", "p", "div", "span", "a",
]);

export function sanitizeHtml(html) {
  if (!html) return "";
  const wrap = document.createElement("div");
  wrap.innerHTML = html;
  cleanNode(wrap);
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

    // Strip event-handler attributes
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
 * Paste sanitizer — like sanitizeHtml but strips ALL attributes.
 * Use this on paste events to discard Gmail/Google Docs metadata attributes
 * (jsslot, data-path-to-node, style, class, etc.) while keeping safe tags.
 */
export function sanitizePaste(html) {
  if (!html) return "";
  const wrap = document.createElement("div");
  wrap.innerHTML = html;
  cleanPasteNode(wrap);
  return wrap.innerHTML;
}

function cleanPasteNode(node) {
  for (const child of [...node.childNodes]) {
    if (child.nodeType === 8) { child.remove(); continue; } // strip comments
    if (child.nodeType !== 1) continue;                     // leave text nodes

    const tag = child.tagName.toLowerCase();
    if (!SAFE_TAGS.has(tag)) {
      while (child.firstChild) node.insertBefore(child.firstChild, child);
      child.remove();
      continue;
    }
    // Strip every attribute — no class, no style, no Gmail-specific attrs
    for (const attr of [...child.attributes]) child.removeAttribute(attr.name);
    cleanPasteNode(child);
  }
}
