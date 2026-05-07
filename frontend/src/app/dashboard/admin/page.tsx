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
    <div className="bg-slate-50 min-h-screen font-['Inter']">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-6 mb-16">
            <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-2">Platform Command</h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Managing {users.length} Registered Identities</p>
            </div>
            <button 
                onClick={() => { localStorage.clear(); router.push("/auth"); }}
                className="px-6 py-3 rounded-2xl bg-red-50 text-red-600 font-black text-[10px] uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all"
            >
                Terminate Session
            </button>
        </div>

        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 tracking-widest uppercase">Member ID</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 tracking-widest uppercase">Identity</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 tracking-widest uppercase">Security Role</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 tracking-widest uppercase">Contact Matrix</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 tracking-widest uppercase text-right">Operations</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                {users.map((user) => {
                    const isSystemAdmin = user.is_staff || user.is_superuser || user.role === 'ADMIN';
                    return (
                    <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-8 py-6">
                            <span className="font-black text-slate-300 text-xs tracking-tighter">#00{user.id}</span>
                        </td>
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs">
                                    {user.username[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 leading-none mb-1">{user.username}</p>
                                    <p className="text-xs font-bold text-slate-400">{user.full_name || 'No legal name'}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                isSystemAdmin ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 
                                user.role === 'HOST' ? 'bg-teal-50 text-teal-600 border border-teal-100' : 
                                'bg-slate-50 text-slate-500 border border-slate-100'
                            }`}>
                                {isSystemAdmin ? 'Administrator' : user.role}
                            </span>
                        </td>
                        <td className="px-8 py-6">
                            <p className="text-xs font-bold text-slate-600 mb-1">{user.email}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.phone_number || 'No Phone Verified'}</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-2">
                                <button 
                                    onClick={() => handleEditClick(user)}
                                    className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                </button>
                                <button 
                                    onClick={() => handleDelete(user.id)}
                                    className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
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
