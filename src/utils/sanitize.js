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
