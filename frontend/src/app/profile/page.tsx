"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/config";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    full_name: "",
    phone_number: "",
    address: "",
    role: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      router.push("/auth");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/profile/`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          router.push("/auth");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const token = localStorage.getItem("access");
    try {
      const res = await fetch(`${API_URL}/api/auth/profile/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: profile.full_name,
          phone_number: profile.phone_number,
          address: profile.address,
          email: profile.email
        })
      });

      if (res.ok) {
        setMessage("Profile updated successfully!");
        const data = await res.json();
        setProfile(data);
      } else {
        setMessage("Failed to update profile.");
      }
    } catch (err) {
      console.error("Update error:", err);
      setMessage("An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="bg-surface text-on-surface min-h-screen font-['Inter']">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-primary tracking-tighter">LuxeStay</Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Home</Link>
            <Link href="/explore" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Explore</Link>
            <button onClick={() => {
              localStorage.clear();
              router.push("/auth");
            }} className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-slate-100">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              <span className="material-symbols-outlined text-5xl text-primary">person</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{profile.username}</h1>
              <p className="text-slate-500 font-medium">Role: <span className="text-primary font-bold">{profile.role}</span></p>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-xl mb-8 text-sm font-bold ${message.includes("successfully") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 tracking-widest mb-2 uppercase">Email ID</label>
                <input 
                  type="email" 
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 tracking-widest mb-2 uppercase">Full Name</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all"
                  value={profile.full_name}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 tracking-widest mb-2 uppercase">Phone Number</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all"
                  value={profile.phone_number}
                  onChange={(e) => setProfile({...profile, phone_number: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 tracking-widest mb-2 uppercase">Address</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all"
                  value={profile.address}
                  onChange={(e) => setProfile({...profile, address: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={saving}
                className="w-full md:w-auto px-12 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
