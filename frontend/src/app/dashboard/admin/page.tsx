"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/config";

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
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    const token = localStorage.getItem("access");
    try {
      const res = await fetch(`${API_URL}/api/auth/users/${userId}/`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        alert("Failed to delete user.");
      }
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
      } else {
        alert("Failed to update user.");
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="bg-surface text-on-surface min-h-screen font-['Inter']">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-primary tracking-tighter">LuxeStay ADMIN</Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Home</Link>
          <button onClick={() => {
            localStorage.clear();
            router.push("/auth");
          }} className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">System Users</h1>
          <p className="text-slate-500">Manage all users, hosts, and administrators.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-black text-slate-400 tracking-widest">ID</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 tracking-widest">USERNAME</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 tracking-widest">EMAIL ID</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 tracking-widest">PHONE</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 tracking-widest">ROLE</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 tracking-widest">FULL NAME</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 tracking-widest text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const isSystemAdmin = user.is_staff || user.is_superuser || user.role === 'ADMIN';
                return (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-400">{user.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{user.username}</td>
                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                    <td className="px-6 py-4 text-slate-600">{user.phone_number || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isSystemAdmin ? 'bg-purple-100 text-purple-700' : 
                        user.role === 'HOST' ? 'bg-blue-100 text-blue-700' : 
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {isSystemAdmin ? 'ADMIN' : user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{user.full_name || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleEditClick(user)}
                        className="text-primary font-bold hover:underline"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="ml-4 text-error font-bold hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Edit User: {editingUser.username}</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 tracking-widest mb-2 uppercase">Full Name</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                  value={editFormData.full_name}
                  onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 tracking-widest mb-2 uppercase">Phone Number</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                  value={editFormData.phone_number}
                  onChange={(e) => setEditFormData({...editFormData, phone_number: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 tracking-widest mb-2 uppercase">Role</label>
                <select 
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                >
                  <option value="NORMAL">NORMAL</option>
                  <option value="HOST">HOST</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="flex gap-4 mt-8">
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-container transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

