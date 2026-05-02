import { get, post } from './api';

const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export const getFoodStatus          = ()            => get('/food/status');
export const subscribeToFood        = ()            => post('/food/subscribe', {});

// Button 1 — cancel / restore next week only
export const cancelNextWeekFood     = ()            => post('/food/cancel-week', {});
export const undoCancelNextWeekFood = ()            => post('/food/undo-cancel-week', {});

// Button 2 — cancel this year / restore
export const bulkDisableFood        = ()            => post('/food/cancel', {});
export const undoBulkDisableFood    = ()            => post('/food/undo-cancel', {});

// Button 3 — enable next week only / undo
export const enableNextWeekFood     = ()            => post('/food/enable-next-week', {});
export const undoEnableNextWeekFood = ()            => post('/food/undo-enable-next-week', {});

// Button 4 — enable full year
export const enableFoodYear         = ()            => post('/food/enable-year', {});
export const disableFoodYear        = ()            => post('/food/disable-year', {});

export const triggerFoodReminder    = ()            => post('/push/trigger-reminder', {});

export const getFoodCalendar        = (month, year) => get(`/food/calendar?month=${month}&year=${year}`);
export const getFoodReport          = (params)      => get(`/food/report?${new URLSearchParams(params)}`);

export async function downloadFoodReport(params) {
  const token = localStorage.getItem('rts_token');
  const query = new URLSearchParams(params).toString();
  const res   = await fetch(`${BASE_URL}/food/report/download?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `food-report.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
