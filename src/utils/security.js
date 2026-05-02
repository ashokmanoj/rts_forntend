/**
 * utils/security.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Security utilities for the frontend.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Sanitizes a URL to prevent XSS via `javascript:` protocols.
 * @param {string} url - The URL to sanitize.
 * @returns {string} - The sanitized URL or a safe fallback.
 */
export function sanitizeUrl(url) {
  if (!url) return "";
  
  // Remove control characters and whitespace
  const cleanedUrl = url.replace(/[^\x20-\x7E]/g, "").trim();
  
  // Check for common malicious protocols
  if (/^(javascript|data|vbscript):/i.test(cleanedUrl)) {
    console.warn("Blocked potentially malicious URL:", cleanedUrl);
    return "about:blank";
  }
  
  return cleanedUrl;
}
