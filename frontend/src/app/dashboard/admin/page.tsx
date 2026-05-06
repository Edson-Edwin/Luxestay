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
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access");
    const role = localStorage.getItem("role");

    if (!token || role !== "ADMIN") {
      // In a real app, you'd check if role is ADMIN or if they are a superuser
      // For now, let's assume 'ADMIN' role is set in profile
      router.push("/auth");
      return;
    }

    const fetchUsers = async () => {
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

    fetchUsers();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="bg-surface text-on-surface min-h-screen font-['Inter']">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-primary tracking-tighter">LuxeStay ADMIN</Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Home</Link>
            <button onClick={() => { localStorage.clear(); router.push("/auth"); }} className="text-sm font-bold text-error">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">System Users</h1>
          <p className="text-slate-500">Manage all users, owners, and administrators.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-black text-slate-400 tracking-widest">ID</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 tracking-widest">USERNAME</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 tracking-widest">EMAIL</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 tracking-widest">ROLE</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 tracking-widest">FULL NAME</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 tracking-widest text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-400">{user.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{user.username}</td>
                  <td className="px-6 py-4 text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
                      user.role === 'OWNER' ? 'bg-blue-100 text-blue-700' : 
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.full_name || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary font-bold hover:underline">Edit</button>
                    <button className="ml-4 text-error font-bold hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
