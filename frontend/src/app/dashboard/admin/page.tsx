"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_staff: boolean;
  is_superuser: boolean;
  full_name: string;
  phone_number: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const router = useRouter();

  const fetchUsers = async () => {
    const token = localStorage.getItem("access");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/accounts/profile/all/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.status === 403 || res.status === 401) {
        router.push("/auth");
        return;
      }
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "ADMIN") {
      router.push("/auth");
      return;
    }
    fetchUsers();
  }, [router]);

  const handleDelete = async (userId: number) => {
    if (!confirm("Permanently delete this user account?")) return;
    const token = localStorage.getItem("access");
    try {
      const res = await fetch(`${API_URL}/api/accounts/profile/${userId}/`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const token = localStorage.getItem("access");
    try {
      const res = await fetch(`${API_URL}/api/accounts/profile/${editingUser.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editingUser)
      });
      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div></div>;

  return (
    <div className="bg-slate-50 min-h-screen font-['Inter']">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 space-y-8">
        {/* Simple Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Platform Command</h1>
                <p className="text-sm text-slate-500">Managing {users.length} registered system users.</p>
            </div>
            <button 
                onClick={() => { localStorage.clear(); router.push("/auth"); }}
                className="px-6 py-3 rounded-xl border border-red-100 text-red-600 font-bold text-sm hover:bg-red-50 transition-all"
            >
                Sign Out
            </button>
        </div>

        {/* Crisp Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { label: "Total Users", value: users.length, icon: "people", color: "text-slate-900" },
                { label: "Registered Hosts", value: users.filter(u => u.role === 'HOST').length, icon: "key", color: "text-teal-600" },
                { label: "Staff Access", value: users.filter(u => u.is_staff).length, icon: "shield", color: "text-indigo-600" }
            ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-slate-50 ${stat.color} flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>

        {/* Neat Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User Details</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Assigned Role</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Contact Information</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                    const isSystemAdmin = user.is_staff || user.is_superuser || user.role === 'ADMIN';
                    return (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                                    {user.username[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 leading-none mb-1">{user.username}</p>
                                    <p className="text-xs text-slate-400">#{user.id}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                                isSystemAdmin ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                                user.role === 'HOST' ? 'bg-teal-50 text-teal-600 border-teal-100' : 
                                'bg-slate-50 text-slate-500 border-slate-200'
                            }`}>
                                {isSystemAdmin ? 'Staff' : user.role}
                            </span>
                        </td>
                        <td className="px-8 py-6">
                            <p className="text-sm font-semibold text-slate-700">{user.email}</p>
                            <p className="text-xs text-slate-400">{user.phone_number || 'No phone link'}</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-2">
                                <button 
                                    onClick={() => handleEditClick(user)}
                                    className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                                    title="Edit User"
                                >
                                    <span className="material-symbols-outlined text-xl">edit</span>
                                </button>
                                <button 
                                    onClick={() => handleDelete(user.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Delete User"
                                >
                                    <span className="material-symbols-outlined text-xl">delete</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
          </div>
        </div>

        {/* Clean Edit Modal */}
        {editingUser && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                <div className="absolute inset-0 bg-slate-900/40" onClick={() => setEditingUser(null)}></div>
                <div className="relative w-full max-w-lg bg-white rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Modify User Identity</h2>
                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</label>
                                <select 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-teal-500"
                                    value={editingUser.role}
                                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                                >
                                    <option value="NORMAL">Normal</option>
                                    <option value="HOST">Host</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                                <input 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-teal-500"
                                    type="text"
                                    value={editingUser.full_name || ''}
                                    onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                            <input 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-teal-500"
                                type="email"
                                value={editingUser.email}
                                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="submit" className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-teal-600 transition-all">Save Changes</button>
                            <button type="button" onClick={() => setEditingUser(null)} className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
