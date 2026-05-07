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
    if (!confirm("Permanently remove this identity from the system?")) return;
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;

  return (
    <div className="bg-[#fcfdfe] min-h-screen font-['Inter'] selection:bg-teal-100 selection:text-teal-900 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none"></div>
      <div className="absolute top-[10%] right-[5%] w-96 h-96 bg-indigo-200/20 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-[10%] left-[5%] w-96 h-96 bg-teal-200/20 blur-[100px] rounded-full"></div>

      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10">
        {/* Command Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-8 h-[2px] bg-teal-500"></span>
                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-[0.4em]">Internal Operations</span>
                </div>
                <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-4">System Console</h1>
                <p className="text-slate-500 font-medium text-lg">Overseeing <span className="text-slate-900 font-bold">{users.length} unique digital identities</span> within the LuxeStay ecosystem.</p>
            </div>
            <div className="flex gap-4">
                <button 
                    onClick={() => { localStorage.clear(); router.push("/auth"); }}
                    className="px-8 py-5 rounded-2xl bg-white border border-slate-100 text-red-500 font-black text-[11px] uppercase tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm active:scale-95"
                >
                    Terminate Session
                </button>
            </div>
        </div>

        {/* Global Intelligence Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
            {[
                { label: "Total Accounts", value: users.length, icon: "fingerprint", color: "text-slate-900", bg: "bg-slate-50" },
                { label: "Verified Hosts", value: users.filter(u => u.role === 'HOST').length, icon: "verified", color: "text-teal-600", bg: "bg-teal-50" },
                { label: "Privileged Staff", value: users.filter(u => u.is_staff).length, icon: "shield", color: "text-indigo-600", bg: "bg-indigo-50" },
                { label: "Active Nodes", value: "3", icon: "hub", color: "text-emerald-600", bg: "bg-emerald-50" }
            ].map((stat, i) => (
                <div key={i} className="bg-white/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
                    <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                        <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                </div>
            ))}
        </div>

        {/* Identity Registry */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[4rem] border border-white/60 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.05)] overflow-hidden mb-24">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                <tr className="bg-slate-900/5 border-b border-slate-100">
                    <th className="px-12 py-10 text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase">Digital ID</th>
                    <th className="px-12 py-10 text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase">Entity Profile</th>
                    <th className="px-12 py-10 text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase">Security Clearance</th>
                    <th className="px-12 py-10 text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase">Communication Vector</th>
                    <th className="px-12 py-10 text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase text-right">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                {users.map((user) => {
                    const isSystemAdmin = user.is_staff || user.is_superuser || user.role === 'ADMIN';
                    return (
                    <tr key={user.id} className="hover:bg-white/40 transition-colors group">
                        <td className="px-12 py-10">
                            <span className="font-black text-slate-300 text-xs tracking-[0.2em]">#U-{user.id.toString().padStart(4, '0')}</span>
                        </td>
                        <td className="px-12 py-10">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-black text-lg shadow-inner">
                                    {user.username[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 tracking-tight text-xl mb-1 group-hover:text-teal-600 transition-colors">{user.username}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.full_name || 'Legal Identity Unverified'}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-12 py-10">
                            <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                                isSystemAdmin ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                                user.role === 'HOST' ? 'bg-teal-50 text-teal-600 border-teal-100' : 
                                'bg-slate-50 text-slate-400 border-slate-100'
                            }`}>
                                {isSystemAdmin ? 'System Admin' : user.role === 'NORMAL' ? 'Standard Guest' : 'Certified Host'}
                            </span>
                        </td>
                        <td className="px-12 py-10">
                            <p className="text-sm font-black text-slate-700 mb-1">{user.email}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.phone_number || 'Mobile Link Inactive'}</p>
                        </td>
                        <td className="px-12 py-10 text-right">
                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                <button 
                                    onClick={() => handleEditClick(user)}
                                    className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-teal-600 hover:border-teal-100 hover:scale-110 transition-all shadow-sm flex items-center justify-center"
                                >
                                    <span className="material-symbols-outlined text-lg">tune</span>
                                </button>
                                <button 
                                    onClick={() => handleDelete(user.id)}
                                    className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 hover:scale-110 transition-all shadow-sm flex items-center justify-center"
                                >
                                    <span className="material-symbols-outlined text-lg">delete_forever</span>
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

        {/* Identity Modification Overlay */}
        {editingUser && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEditingUser(null)}></div>
                <div className="relative w-full max-w-xl bg-white rounded-[4rem] p-16 shadow-2xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-3xl rounded-full"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-10">Modify Identity</h2>
                        <form onSubmit={handleUpdate} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Role Authority</label>
                                    <select 
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-black text-sm text-slate-900 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-500 transition-all"
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                                    >
                                        <option value="NORMAL">Normal Guest</option>
                                        <option value="HOST">Host Partner</option>
                                        <option value="ADMIN">System Admin</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Legal Verification</label>
                                    <input 
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-black text-sm text-slate-900 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-500 transition-all"
                                        type="text"
                                        value={editingUser.full_name || ''}
                                        onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                                        placeholder="Full Legal Name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Primary Email</label>
                                <input 
                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-black text-sm text-slate-900 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-500 transition-all"
                                    type="email"
                                    value={editingUser.email}
                                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-1 bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-teal-600 transition-all shadow-xl shadow-teal-500/10">Commit Changes</button>
                                <button type="button" onClick={() => setEditingUser(null)} className="px-10 py-5 rounded-3xl bg-slate-50 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
