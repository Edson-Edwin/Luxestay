"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { API_URL } from "@/lib/config";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    phone_number: "",
    address: "",
    role: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem("access");
    if (!token) {
      window.location.href = "/auth";
      return;
    }

    fetch(`${API_URL}/api/auth/profile/`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setFormData({
          username: data.username,
          email: data.email,
          full_name: data.full_name || "",
          phone_number: data.phone_number || "",
          address: data.address || "",
          role: data.role
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    const token = localStorage.getItem("access");

    try {
      const res = await fetch(`${API_URL}/api/auth/profile/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          address: formData.address
        })
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        // Update local storage full name if it exists
        localStorage.setItem("full_name", formData.full_name);
      } else {
        setMessage({ type: "error", text: "Failed to update profile." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An error occurred." });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/auth";
  };

  if (!isClient) return null;
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;

  return (
    <div className="bg-slate-50 min-h-screen font-['Inter']">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-slate-50 pb-8 gap-6">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[2rem] bg-teal-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-teal-600/20">
                    {formData.username[0].toUpperCase()}
                </div>
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">Your Identity</h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{formData.role} Member</p>
                </div>
            </div>
            <button 
                onClick={handleLogout}
                className="px-6 py-3 rounded-2xl bg-red-50 text-red-600 font-black text-[10px] uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all"
            >
                Terminate Session
            </button>
          </div>

          {message.text && (
            <div className={`p-6 rounded-2xl mb-12 border flex items-center gap-3 ${message.type === 'success' ? 'bg-teal-50 border-teal-100 text-teal-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
              <span className="material-symbols-outlined">{message.type === 'success' ? 'verified' : 'error'}</span>
              <p className="text-sm font-bold">{message.text}</p>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 opacity-60">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Account Username</label>
                    <input disabled type="text" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm text-slate-900 outline-none cursor-not-allowed" value={formData.username} />
                </div>
                <div className="space-y-2 opacity-60">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                    <input disabled type="email" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm text-slate-900 outline-none cursor-not-allowed" value={formData.email} />
                </div>
            </div>

            <div className="space-y-8 pt-8 border-t border-slate-50">
                <h2 className="text-sm font-black text-teal-600 uppercase tracking-widest">Personal Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Legal Name</label>
                        <input 
                            required 
                            type="text" 
                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" 
                            value={formData.full_name} 
                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Phone Number</label>
                        <input 
                            required 
                            type="tel" 
                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" 
                            value={formData.phone_number} 
                            onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Physical Address</label>
                    <textarea 
                        required 
                        rows={3} 
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" 
                        value={formData.address} 
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                    ></textarea>
                </div>
            </div>

            <button 
                disabled={saving} 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-teal-600 text-white font-black py-6 rounded-[2rem] transition-all active:scale-[0.98] mt-12 text-sm uppercase tracking-widest shadow-2xl shadow-slate-900/10"
            >
                {saving ? "Updating Profile..." : "Synchronize Identity"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
