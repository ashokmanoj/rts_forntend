/**
 * pages/AdminReportPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Shows user log report with last login and usage duration.
 * Includes client-side filtering by name, dept, status, and date range.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { get } from "../services/api";
import { ArrowLeft, Clock, UserCheck, ShieldCheck, Search, Filter, Calendar, X, ChevronDown, BarChart3, Users } from "lucide-react";

// React Datepicker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AdminReportPage() {
  const [activeTab, setActiveTab] = useState("users"); // "users" or "depts"
  const [report, setReport] = useState([]);
  const [deptReport, setDeptReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    empId: "all",
    dept: "all",
    startDate: null,
    endDate: null,
  });

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const endpoint = activeTab === "users" ? "/admin/user-log-report" : "/admin/dept-tracking-report";
    get(endpoint)
      .then((data) => {
        if (activeTab === "users") setReport(data);
        else setDeptReport(data);
      })
      .catch((err) => console.error("Failed to load report", err))
      .finally(() => setLoading(false));
  }, [activeTab]);

  // ── Options for Dropdowns ────────────────────────────────────────────────
  const dropdownOptions = useMemo(() => {
    const depts = [...new Set(report.map(u => u.dept))].sort();
    const users = report.map(u => ({ id: u.empId, name: `${u.name} (${u.empId})` }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return { depts, users };
  }, [report]);

  // ── Filtering Logic (Users) ───────────────────────────────────────────────
  const filteredReport = useMemo(() => {
    if (activeTab !== "users") return [];
    return report.filter((user) => {
      // 1. Search
      const term = filters.search.toLowerCase().trim();
      const matchesSearch = !term || 
        user.name.toLowerCase().includes(term) ||
        user.empId.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term);

      // 2. Status
      const matchesStatus = filters.status === "all" || 
        (filters.status === "active" && user.isActive) ||
        (filters.status === "inactive" && !user.isActive);

      // 3. User Dropdown
      const matchesUser = filters.empId === "all" || user.empId === filters.empId;

      // 4. Dept Dropdown
      const matchesDept = filters.dept === "all" || user.dept === filters.dept;

      // 5. Date Range
      let matchesDate = true;
      if (user.lastLogin && (filters.startDate || filters.endDate)) {
        const loginDate = new Date(user.lastLogin);
        if (filters.startDate) {
          const start = new Date(filters.startDate);
          start.setHours(0,0,0,0);
          if (loginDate < start) matchesDate = false;
        }
        if (filters.endDate) {
          const end = new Date(filters.endDate);
          end.setHours(23,59,59,999);
          if (loginDate > end) matchesDate = false;
        }
      } else if (!user.lastLogin && (filters.startDate || filters.endDate)) {
        matchesDate = false;
      }

      return matchesSearch && matchesStatus && matchesUser && matchesDept && matchesDate;
    });
  }, [report, filters, activeTab]);

  // ── Filtering Logic (Depts) ──────────────────────────────────────────────
  const filteredDeptReport = useMemo(() => {
    if (activeTab !== "depts") return [];
    return deptReport.filter(d => {
      const term = filters.search.toLowerCase().trim();
      return !term || d.deptName.toLowerCase().includes(term);
    });
  }, [deptReport, filters.search, activeTab]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const resetFilters = () => {
    setFilters({ search: "", status: "all", empId: "all", dept: "all", startDate: null, endDate: null });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col">
      
      {/* ── Sticky Top Section ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#f8fafc] pt-4 sm:pt-8 px-3 sm:px-8 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <ArrowLeft size={24} className="text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Admin Analytics</h1>
                <p className="text-slate-500 text-[12px] font-bold uppercase mt-1 tracking-wider">System Activity & Performance</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => setActiveTab("users")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                  activeTab === "users" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Users size={14} /> User Logs
              </button>
              <button
                onClick={() => setActiveTab("depts")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                  activeTab === "depts" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <BarChart3 size={14} /> Dept Performance
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-100 mb-6 flex flex-wrap items-end gap-3">
            
            {/* Search */}
            <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder={activeTab === "users" ? "Name, ID or Email..." : "Search Department..."}
                  className="w-full bg-slate-50 border border-slate-200 py-1.5 pl-8 pr-4 rounded-xl text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              </div>
            </div>

            {activeTab === "users" && (
              <>
                <div className="flex flex-col gap-1 min-w-[120px] flex-1 sm:flex-none sm:min-w-[160px]">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Select User</label>
                  <div className="relative">
                    <select
                      value={filters.empId}
                      onChange={(e) => setFilters(prev => ({ ...prev, empId: e.target.value }))}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 py-1.5 pl-3 pr-8 rounded-xl text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                    >
                      <option value="all">All Users</option>
                      {dropdownOptions.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                  </div>
                </div>

                <div className="flex flex-col gap-1 min-w-[110px] flex-1 sm:flex-none sm:min-w-[140px]">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Department</label>
                  <div className="relative">
                    <select
                      value={filters.dept}
                      onChange={(e) => setFilters(prev => ({ ...prev, dept: e.target.value }))}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 py-1.5 pl-3 pr-8 rounded-xl text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                    >
                      <option value="all">All Dept</option>
                      {dropdownOptions.depts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                  </div>
                </div>

                <div className="flex flex-col gap-1 w-28">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Status</label>
                  <div className="relative">
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 py-1.5 pl-3 pr-8 rounded-xl text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                    >
                      <option value="all">All</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                  </div>
                </div>

                <div className="flex flex-col gap-1 min-w-[220px]">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Date Range (Last Login)</label>
                  <div className="relative">
                    <DatePicker
                      selectsRange={true}
                      startDate={filters.startDate}
                      endDate={filters.endDate}
                      onChange={(update) => {
                        const [start, end] = update;
                        setFilters(prev => ({ ...prev, startDate: start, endDate: end }));
                      }}
                      isClearable={true}
                      placeholderText="Select Date Range"
                      className="w-full bg-slate-50 border border-slate-200 py-1.5 pl-8 pr-4 rounded-xl text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                    />
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                  </div>
                </div>
              </>
            )}

            {/* Reset */}
            {(filters.search || filters.status !== "all" || filters.empId !== "all" || filters.dept !== "all" || filters.startDate) && (
              <button
                onClick={resetFilters}
                className="h-8 px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-black text-[10px] transition-all flex items-center gap-1 shadow-sm border border-red-100"
              >
                <X size={13} /> CLEAR
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Scrollable Body ─────────────────────────────────────────────── */}
      <div className="flex-1 px-3 sm:px-8 py-4 sm:py-6 overflow-auto">
        <div className="max-w-7xl mx-auto">

          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden mb-8">
            <div className="overflow-x-auto">
            {activeTab === "users" ? (
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Sl.No</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">User ID</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">User Details</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Login</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Usage Hours</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-[11px]">
                  {filteredReport.length > 0 ? (
                    filteredReport.map((user, idx) => (
                      <tr key={user.empId} className="hover:bg-slate-50/50 transition-all group">
                        <td className="px-6 py-4 font-bold text-slate-400">{idx + 1}</td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-lg font-bold text-[9px]">
                            {user.empId}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{user.name}</span>
                            <span className="text-slate-500 text-[10px]">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-600">{user.dept}</td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{user.phone}</td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{formatDate(user.lastLogin)}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-black text-[10px] border border-indigo-100">
                            <Clock size={11} />
                            {user.totalUsageHours} hrs
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className={`inline-flex w-2 h-2 rounded-full ${user.isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-slate-300"}`} />
                            <span className={`font-black uppercase text-[9px] ${user.isActive ? "text-green-600" : "text-slate-400"}`}>
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="8" className="px-6 py-20 text-center text-slate-400 uppercase font-black text-[11px]">No matching records</td></tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Department Name</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Total Requests</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center text-blue-600">Open</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center text-orange-500">Pending</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center text-green-600">Resolved</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center text-red-500">Rejected</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Avg. Res. Time</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Efficiency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-[11px]">
                  {filteredDeptReport.length > 0 ? (
                    filteredDeptReport.map((dept) => (
                      <tr key={dept.deptName} className="hover:bg-slate-50/50 transition-all group">
                        <td className="px-6 py-4">
                          <span className="font-black text-slate-800">{dept.deptName}</span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-600">{dept.total}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-black ${dept.open > 5 ? "text-red-500 underline decoration-wavy" : "text-blue-600"}`}>
                            {dept.open}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-orange-500">{dept.pending}</td>
                        <td className="px-6 py-4 text-center font-bold text-green-600">{dept.closed}</td>
                        <td className="px-6 py-4 text-center font-bold text-red-400">{dept.rejected}</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-500">
                          {dept.avgResolutionDays === "N/A" ? "—" : `${dept.avgResolutionDays} days`}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                              <div 
                                className={`h-full transition-all duration-1000 ${
                                  dept.efficiency > 80 ? "bg-green-500" : dept.efficiency > 50 ? "bg-orange-400" : "bg-red-500"
                                }`}
                                style={{ width: `${dept.efficiency}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-black text-slate-700">{dept.efficiency}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="8" className="px-6 py-20 text-center text-slate-400 uppercase font-black text-[11px]">No data available</td></tr>
                  )}
                </tbody>
              </table>
            )}
            </div>{/* end overflow-x-auto */}
          </div>

          <div className="flex items-center justify-between px-4 pb-12">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {activeTab === "users" 
                ? `Showing ${filteredReport.length} of ${report.length} users` 
                : `Tracking performance across ${filteredDeptReport.length} departments`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
