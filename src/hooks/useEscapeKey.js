import { useEffect } from "react";

/**
 * Calls `onClose` whenever the Escape key is pressed.
 * Automatically cleaned up when the component unmounts.
 *
 * Usage:  useEscapeKey(onClose);
 */
export function useEscapeKey(onClose) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
}
