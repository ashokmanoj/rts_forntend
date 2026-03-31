// ─────────────────────────────────────────────────────────────
// Mock seed data — swapped out by API calls when backend is live
// ─────────────────────────────────────────────────────────────

export const MOCK_REQUESTS = [
  { id: 1, date: "12/12/2025", empId: "E001", name: "Bradpitt",  purpose: "Mouse",    dept: "IT",    designation: "Sr. Dev", location: "Thripura",  rmStatus: "--",      rmDate: null,             hodStatus: "--",      hodDate: null,             assignedDept: "IT", resolvedDate: null, resolvedBy: "-", forwarded: false, forwardedBy: null, forwardedAt: null, seen: true, assignedStatus: "Open" },
  { id: 2, date: "13/12/2025", empId: "E042", name: "Tarantino", purpose: "Keyboard", dept: "Admin", designation: "Manager", location: "Assam",     rmStatus: "Approved", rmDate: "14/12/2025 09:30", hodStatus: "--",      hodDate: null,             assignedDept: "IT", resolvedDate: null, resolvedBy: "-", forwarded: false, forwardedBy: null, forwardedAt: null, seen: true, assignedStatus: "Open" },
  { id: 3, date: "14/12/2025", empId: "E001", name: "Bradpitt",  purpose: "Laptop",   dept: "IT",    designation: "Sr. Dev", location: "Delhi",     rmStatus: "Rejected", rmDate: "15/12/2025 11:00", hodStatus: "--",      hodDate: null,             assignedDept: "IT", resolvedDate: null, resolvedBy: "-", forwarded: false, forwardedBy: null, forwardedAt: null, seen: true, assignedStatus: "Open" },
  { id: 4, date: "15/12/2025", empId: "E042", name: "Tarantino", purpose: "Monitor",  dept: "Admin", designation: "Manager", location: "Chennai",   rmStatus: "Approved", rmDate: "16/12/2025 10:15", hodStatus: "Approved", hodDate: "17/12/2025 14:00", assignedDept: "IT", resolvedDate: null, resolvedBy: "-", forwarded: false, forwardedBy: null, forwardedAt: null, seen: true, assignedStatus: "Open" },
  { id: 5, date: "16/12/2025", empId: "E001", name: "Bradpitt",  purpose: "Mouse",    dept: "IT",    designation: "Sr. Dev", location: "Kolkata",   rmStatus: "--",      rmDate: null,             hodStatus: "--",      hodDate: null,             assignedDept: "IT", resolvedDate: null, resolvedBy: "-", forwarded: false, forwardedBy: null, forwardedAt: null, seen: true, assignedStatus: "Open" },
  { id: 6, date: "17/12/2025", empId: "E042", name: "Tarantino", purpose: "Keyboard", dept: "Admin", designation: "Manager", location: "Mumbai",    rmStatus: "Approved", rmDate: "18/12/2025 08:45", hodStatus: "--",      hodDate: null,             assignedDept: "IT", resolvedDate: null, resolvedBy: "-", forwarded: false, forwardedBy: null, forwardedAt: null, seen: true, assignedStatus: "Open" },
  { id: 7, date: "18/12/2025", empId: "E001", name: "Bradpitt",  purpose: "Mouse",    dept: "IT",    designation: "Sr. Dev", location: "Bangalore", rmStatus: "--",      rmDate: null,             hodStatus: "--",      hodDate: null,             assignedDept: "IT", resolvedDate: null, resolvedBy: "-", forwarded: false, forwardedBy: null, forwardedAt: null, seen: true, assignedStatus: "Open" },
  { id: 8, date: "19/12/2025", empId: "E042", name: "Tarantino", purpose: "Keyboard", dept: "Admin", designation: "Manager", location: "Pune",      rmStatus: "Approved", rmDate: "20/12/2025 12:00", hodStatus: "Approved", hodDate: "21/12/2025 09:30", assignedDept: "IT", resolvedDate: null, resolvedBy: "-", forwarded: false, forwardedBy: null, forwardedAt: null, seen: true, assignedStatus: "Open" },
];

export const MOCK_CHAT_LOGS = {
  1: [
    { id: 1, author: "Bradpitt",   role: "Employee", text: "Mouse beku",                              time: "13:30", date: "12/12/2025", type: "message" },
    { id: 2, author: "John Cena",  role: "RM",       text: "Please do the needful",                   time: "13:45", date: "12/12/2025", type: "message" },
  ],
  2: [
    { id: 1, author: "Tarantino",  role: "Employee", text: "Keyboard is not working, need replacement", time: "09:00", date: "13/12/2025", type: "message" },
    { id: 2, author: "RM Manager", role: "RM",       text: "Approved. Forwarding to HOD.",              time: "09:30", date: "14/12/2025", type: "approval", status: "Approved", purpose: "Keyboard", changedDept: null, originalDept: "IT" },
  ],
  3: [
    { id: 1, author: "Bradpitt",   role: "Employee", text: "Need a new laptop urgently",               time: "10:00", date: "14/12/2025", type: "message" },
    { id: 2, author: "RM Manager", role: "RM",       text: "Budget not available currently.",           time: "11:00", date: "15/12/2025", type: "approval", status: "Rejected", purpose: "Laptop",   changedDept: null, originalDept: "IT" },
  ],
  4: [
    { id: 1, author: "Tarantino",  role: "Employee", text: "Monitor screen flickering, need new one",  time: "09:00", date: "15/12/2025", type: "message" },
    { id: 2, author: "RM Manager", role: "RM",       text: "Approved. Escalating to HOD.",              time: "10:15", date: "16/12/2025", type: "approval", status: "Approved", purpose: "Monitor",  changedDept: null, originalDept: "IT" },
    { id: 3, author: "HOD Singh",  role: "HOD",      text: "Verified and approved. IT to procure.",     time: "14:00", date: "17/12/2025", type: "approval", status: "Approved", purpose: "Monitor",  changedDept: null, originalDept: "IT" },
  ],
};

// Logged-in user — replaced by JWT payload when backend is connected
export const MOCK_USER = { name: "Bradpitt", role: "Admin" };
