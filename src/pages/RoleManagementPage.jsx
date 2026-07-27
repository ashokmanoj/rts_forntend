import { useState, useEffect, useMemo } from "react";
import { get, post, patch, del } from "../services/api";
import {
  ShieldCheck,
  ShieldOff,
  Plus,
  Search,
  X,
  Save,
  ShieldAlert,
  Edit2,
  CheckCircle,
} from "lucide-react";
import SearchableSelect from "../components/ui/SearchableSelect";

const ROLES = ["Requestor", "RM", "HOD", "DeptHOD", "Management", "Admin", "Intern", "ViewCloseTicket"];
const DEPARTMENTS = [
  "Academics-Assam", "Academics-Karnataka", "Academics-Mizoram", "Academics-Tripura", "Academics-Uttarakhand",
  "Accounts-A", "Accounts-G", "Animation",
  "Broadcasting-Assam", "Broadcasting-Karnataka", "Broadcasting-Mizoram", "Broadcasting-Tripura", "Broadcasting-Uttarakhand",
  "Business Development", "Corporate Communications", "Documentation",
  "Facilities", "Food Committee", "Game Development", "Govt. Relations", "HR", "Interns", "Management",
  "Marketing",
  "Operations-Assam", "Operations-Bihar", "Operations-Karnataka", "Operations-Maharashtra", "Operations-Mizoram", "Operations-Nagaland", "Operations-Sundargarh, Odisha", "Operations-Tripura", "Operations-Uttarakhand",
  "Purchase", "RTS Help Desk", "Software",
  "Stores-Assam", "Stores-Karnataka", "Stores-Mizoram", "Stores-Tripura", "Stores-Uttarakhand",
  "System Admin-Assam", "System Admin-Karnataka", "System Admin-Uttarakhand",
  "TA Committee", "Technical Support"
];

export default function RoleManagementPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const [addForm, setAddForm] = useState({ empId: "", role: "Requestor", dept: "HR" });
  const [editForm, setEditForm] = useState({ role: "Requestor", dept: "HR" });

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await get("/admin/user-roles");
      setRoles(data);
    } catch (err) {
      console.error("Failed to load user roles", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRoles(); }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return roles;
    return roles.filter(r =>
      r.empId.toLowerCase().includes(term) ||
      r.name.toLowerCase().includes(term) ||
      r.role.toLowerCase().includes(term) ||
      r.dept.toLowerCase().includes(term)
    );
  }, [roles, search]);

  const showMsg = (type, msg) => {
    if (type === "success") { setSuccess(msg); setError(""); }
    else { setError(msg); setSuccess(""); }
    setTimeout(() => { setSuccess(""); setError(""); }, 3000);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await post("/admin/user-roles", addForm);
      showMsg("success", "Role assignment added.");
      setShowAddModal(false);
      setAddForm({ empId: "", role: "Requestor", dept: "HR" });
      loadRoles();
    } catch (err) {
      showMsg("error", err.response?.data?.error || "Failed to add role.");
    }
  };

  const openEdit = (entry) => {
    setEditTarget(entry);
    setEditForm({ role: entry.role, dept: entry.dept });
    setShowEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await patch(`/admin/user-roles/${editTarget.id}`, editForm);
      showMsg("success", "Role assignment updated.");
      setShowEditModal(false);
      loadRoles();
    } catch (err) {
      showMsg("error", err.response?.data?.error || "Failed to update role.");
    }
  };

  const handleToggle = async (entry) => {
    try {
      await patch(`/admin/user-roles/${entry.id}/toggle`, {});
      setRoles(prev => prev.map(r => r.id === entry.id ? { ...r, isActive: !r.isActive } : r));
      showMsg("success", `Role ${entry.isActive ? "disabled" : "enabled"} successfully.`);
    } catch (err) {
      showMsg("error", err?.response?.data?.error || err?.message || "Failed to update role status.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 text-violet-600 rounded-xl">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 leading-none">Role Management</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">Assign and manage secondary roles for users</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, role, dept…"
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-medium w-full sm:w-64 focus:ring-2 focus:ring-violet-400 focus:outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl font-black text-[12px] shadow-md transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={16} /> ADD ROLE
          </button>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-[12px] font-bold flex items-center gap-2">
          <CheckCircle size={16} /> {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-[12px] font-bold flex items-center gap-2">
          <ShieldAlert size={16} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="table-scroll">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sl.No</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[12px]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-slate-400 font-bold uppercase text-[10px]">Loading roles...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((entry, idx) => (
                  <tr key={entry.id} className={`transition-colors ${entry.isActive ? "hover:bg-slate-50/50" : "bg-slate-50/40 opacity-60"}`}>
                    <td className="px-6 py-4 font-bold text-slate-400">{idx + 1}</td>
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">{entry.empId}</td>
                    <td className="px-6 py-4 font-black text-slate-800">{entry.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-violet-100 text-violet-700 rounded-full font-black text-[10px] uppercase tracking-tighter">
                        {entry.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">{entry.dept}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-black text-[10px] uppercase ${entry.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${entry.isActive ? "bg-green-500" : "bg-red-500"}`} />
                        {entry.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(entry)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all active:scale-95"
                          title="Edit Role"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleToggle(entry)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-[10px] transition-all active:scale-95 ${entry.isActive ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                          title={entry.isActive ? "Disable Role" : "Enable Role"}
                        >
                          {entry.isActive ? (
                            <><ShieldOff size={14} /> DISABLE</>
                          ) : (
                            <><ShieldCheck size={14} /> ENABLE</>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <p className="text-slate-400 font-black uppercase text-[12px]">No role assignments found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Role Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-zoom-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-violet-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-600 text-white rounded-xl"><Plus size={20} /></div>
                <h3 className="text-xl font-black text-slate-800">Add Role Assignment</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-500 uppercase ml-1">User ID *</label>
                <input
                  required
                  type="text"
                  value={addForm.empId}
                  onChange={(e) => setAddForm({ ...addForm, empId: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-violet-400 focus:outline-none"
                  placeholder="e.g. AI-2300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-500 uppercase ml-1">Role *</label>
                <SearchableSelect
                  value={addForm.role}
                  onChange={(val) => setAddForm({ ...addForm, role: val })}
                  options={ROLES}
                  placeholder="Select role…"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-500 uppercase ml-1">Department *</label>
                <SearchableSelect
                  value={addForm.dept}
                  onChange={(val) => setAddForm({ ...addForm, dept: val })}
                  options={DEPARTMENTS}
                  placeholder="Select department…"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black transition-all active:scale-95"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black shadow-lg shadow-violet-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Save size={18} /> ADD ROLE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && editTarget && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-zoom-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-indigo-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 text-white rounded-xl"><Edit2 size={20} /></div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">Edit Role Assignment</h3>
                  <p className="text-[11px] text-slate-500 font-bold">{editTarget.name} · {editTarget.empId}</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-500 uppercase ml-1">Role *</label>
                <SearchableSelect
                  value={editForm.role}
                  onChange={(val) => setEditForm({ ...editForm, role: val })}
                  options={ROLES}
                  placeholder="Select role…"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-500 uppercase ml-1">Department *</label>
                <SearchableSelect
                  value={editForm.dept}
                  onChange={(val) => setEditForm({ ...editForm, dept: val })}
                  options={DEPARTMENTS}
                  placeholder="Select department…"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black transition-all active:scale-95"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Save size={18} /> UPDATE ROLE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
