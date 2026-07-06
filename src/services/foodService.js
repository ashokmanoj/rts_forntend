import { get, post, patch, del } from './api';

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

export const getFoodCalendar        = (month, year, empId) => get(`/food/calendar?month=${month}&year=${year}${empId ? `&empId=${empId}` : ''}`);
export const getFoodReport          = (params)      => get(`/food/report?${new URLSearchParams(params)}`);

// HR / FoodCommittee / SuperUser — manual entry
export const getFoodUsers        = ()                            => get('/food/admin/users');
export const addFoodManualEntry  = (empId, weekDate, amount, note) => post('/food/admin/manual-entry', { empId, weekDate, amount, note: note || null });

// SuperUser admin CRUD
export const adminGetFoodSubscriptions = ()             => get('/food/admin/subscriptions');
export const adminSubscribeUser        = (empId, period = 'permanent', periodDate = null) => post(`/food/admin/subscribe/${empId}`, { period, periodDate });
export const adminToggleFoodUser       = (empId, isActive) => patch(`/food/admin/toggle/${empId}`, { isActive });
export const adminDeleteFoodUser       = (empId)        => del(`/food/admin/unsubscribe/${empId}`);

// SuperUser: add cancellations for a date range (remove food for those weeks)
function buildQuery(params) {
  const q = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return q ? `?${q}` : '';
}
export const adminPreviewFoodCancelRange  = (params) => get(`/food/admin/cancel-range/count${buildQuery(params)}`);
export const adminCancelFoodRange         = (params) => post('/food/admin/cancel-range', params);

// SuperUser: restore food (delete cancellations)
export const adminCountFoodCancellations  = (params) => get(`/food/admin/cancellations/count${buildQuery(params)}`);
export const adminDeleteFoodCancellations = (params) => del(`/food/admin/cancellations${buildQuery(params)}`);

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
