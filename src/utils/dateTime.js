// ─────────────────────────────────────────────────────────────
// Date / time helpers used across components
// ─────────────────────────────────────────────────────────────

/** "09:32 am" */
export const getNowTime = () =>
  new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

/** "27/2/2026" */
export const getNowDate = () =>
  new Date().toLocaleDateString("en-IN");

/** "27/2/2026 09:32 am" */
export const getNowDateTime = () =>
  `${getNowDate()} ${getNowTime()}`;

/** seconds → "1:05" */
export const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};
