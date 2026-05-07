"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/config";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  full_name: string;
  phone_number: string;
  is_staff: boolean;
  is_superuser: boolean;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    phone_number: "",
    role: ""
  });
  const router = useRouter();

  const fetchUsers = async () => {
    const token = localStorage.getItem("access");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/users/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.status === 401 || res.status === 403) {
          localStorage.clear();
          router.push("/auth");
          return;
      }

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Admin Dashboard error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access");
    const role = localStorage.getItem("role");

    const isAdmin =
      role === "ADMIN" ||
      localStorage.getItem("is_staff") === "true" ||
      localStorage.getItem("is_superuser") === "true";

    if (!token || !isAdmin) {
      router.push("/auth");
      return;
    }

    fetchUsers();
  }, [router]);

  const handleDelete = async (userId: number) => {
    if (!confirm("Are you sure? This will permanently remove the user from the system.")) return;
    const token = localStorage.getItem("access");
    try {
      const res = await fetch(`${API_URL}/api/auth/users/${userId}/`, {
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
    setEditFormData({
      full_name: user.full_name || "",
      phone_number: user.phone_number || "",
      role: user.role
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const token = localStorage.getItem("access");
    try {
      const res = await fetch(`${API_URL}/api/auth/users/${editingUser.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;

  return (
    <div className="bg-white min-h-screen font-['Inter'] selection:bg-teal-100 selection:text-teal-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
            <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 mb-2 block">System Administration</span>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900">Platform Command</h1>
            </div>
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => { localStorage.clear(); router.push("/auth"); }}
                    className="px-8 py-4 rounded-2xl bg-red-50 text-red-600 font-black text-[11px] uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all active:scale-95"
                >
                    Terminate Session
                </button>
            </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            {[
                { label: "Total Identities", value: users.length, icon: "groups", color: "text-slate-900", bg: "bg-slate-50" },
                { label: "Active Hosts", value: users.filter(u => u.role === 'HOST').length, icon: "key", color: "text-teal-600", bg: "bg-teal-50" },
                { label: "System Staff", value: users.filter(u => u.is_staff || u.is_superuser).length, icon: "shield_person", color: "text-indigo-600", bg: "bg-indigo-50" },
                { label: "Security Status", value: "Verified", icon: "verified_user", color: "text-emerald-600", bg: "bg-emerald-50" }
            ].map((stat, i) => (
                <div key={i} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
                    <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <span className="material-symbols-outlined text-xl">{stat.icon}</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                </div>
            ))}
        </div>

        {/* Identities Table */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden mb-24">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Access ID</th>
                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Identity Profile</th>
                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Privilege Level</th>
                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Contact Vector</th>
                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase text-right">Operations</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                {users.map((user) => {
                    const isSystemAdmin = user.is_staff || user.is_superuser || user.role === 'ADMIN';
                    return (
                    <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-10 py-8">
                            <span className="font-black text-slate-300 text-xs tracking-widest">#USR-{user.id.toString().padStart(4, '0')}</span>
                        </td>
                        <td className="px-10 py-8">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-sm">
                                    {user.username[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 tracking-tight text-lg mb-0.5">{user.username}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.full_name || 'No legal name verified'}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-10 py-8">
                            <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] ${
                                isSystemAdmin ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm' : 
                                user.role === 'HOST' ? 'bg-teal-50 text-teal-600 border border-teal-100' : 
                                'bg-slate-50 text-slate-500 border border-slate-100'
                            }`}>
                                {isSystemAdmin ? 'System Admin' : user.role === 'NORMAL' ? 'Standard Guest' : 'Verified Host'}
                            </span>
                        </td>
                        <td className="px-10 py-8">
                            <p className="text-xs font-black text-slate-700 mb-1">{user.email}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.phone_number || 'Mobile Unlinked'}</p>
                        </td>
                        <td className="px-10 py-8 text-right">
                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button 
                                    onClick={() => handleEditClick(user)}
                                    className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-teal-600 hover:border-teal-100 transition-all shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-lg">settings</span>
                                </button>
                                <button 
                                    onClick={() => handleDelete(user.id)}
                                    className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-lg">delete_sweep</span>
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
      </main>

      {/* Edit Overlay */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] p-12 max-w-md w-full shadow-2xl border border-white/20">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-slate-900">Modify Identity</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Editing {editingUser.username}</p>
                </div>
                <button onClick={() => setEditingUser(null)} className="text-slate-300 hover:text-slate-900 transition-colors">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Legal Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20"
                  value={editFormData.full_name}
                  onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Phone Number</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20"
                  value={editFormData.phone_number}
                  onChange={(e) => setEditFormData({...editFormData, phone_number: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Access Level</label>
                <select 
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20 appearance-none"
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                >
                  <option value="NORMAL">Guest</option>
                  <option value="HOST">Host</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              <button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-teal-600 text-white font-black py-5 rounded-[2rem] shadow-xl transition-all active:scale-[0.98] mt-6 text-sm uppercase tracking-widest"
              >
                Apply Changes
              </button>
            </form>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}
