"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ 
    username: "", 
    email: "", 
    password: "",
    role: "NORMAL",
    full_name: "",
    phone_number: "",
    address: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = isLogin
      ? `${API_URL}/api/auth/login/`
      : `${API_URL}/api/auth/register/`;

    try {
      const body = isLogin 
        ? { username: formData.username, password: formData.password } 
        : formData;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || JSON.stringify(data));
      }

      if (isLogin) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);

        let profile = data.user;
        if (!profile) {
          const profileRes = await fetch(`${API_URL}/api/auth/profile/`, {
            headers: { "Authorization": `Bearer ${data.access}` }
          });
          profile = await profileRes.json();
        }

        localStorage.setItem("role", profile.role);
        localStorage.setItem("user_id", String(profile.id));
        localStorage.setItem("username", profile.username);

        if (profile.role === "ADMIN" || profile.is_superuser || profile.is_staff) {
          router.push("/dashboard/admin");
        } else if (profile.role === "HOST") {
          router.push("/dashboard/host");
        } else {
          router.push("/");
        }
      } else {
        setIsLogin(true);
        setError("Success! Please sign in with your credentials.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-['Inter']">
      {/* Visual Side */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0 scale-105">
            <img 
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop" 
              className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
              alt="Luxury"
            />
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-900/40 to-transparent"></div>
        
        <div className="relative z-10 h-full flex flex-col justify-between p-16">
          <Link href="/" className="flex items-center gap-2 group w-fit">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white">
                <span className="material-symbols-outlined font-bold">villa</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">LuxeStay</span>
          </Link>

          <div className="max-w-md">
            <h1 className="text-5xl font-black text-white tracking-tighter leading-tight mb-6">
                Your journey into the <span className="text-teal-400">extraordinary</span> starts here.
            </h1>
            <p className="text-slate-400 text-lg">
                Join our exclusive community and unlock access to the world's most breathtaking sanctuaries.
            </p>
          </div>

          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
            © 2026 LuxeStay International
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white relative">
        <Link href="/" className="absolute top-12 right-12 w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all">
            <span className="material-symbols-outlined">close</span>
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-12">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">
              {isLogin ? "Welcome back" : "Create Account"}
            </h2>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
              {isLogin ? "Sign in to manage your sanctuary" : "Start your journey today"}
            </p>
          </div>

          {error && (
            <div className={`p-5 rounded-2xl mb-8 flex items-center gap-3 border ${error.includes("Success") ? 'bg-teal-50 border-teal-100 text-teal-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
              <span className="material-symbols-outlined text-lg">{error.includes("Success") ? 'verified' : 'error'}</span>
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="flex p-1 bg-slate-50 rounded-2xl mb-8">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, role: "NORMAL"})}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.role === 'NORMAL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Guest
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, role: "HOST"})}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.role === 'HOST' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Host
                </button>
              </div>
            )}

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Username</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-300">person</span>
                        <input 
                            required 
                            type="text" 
                            className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                            value={formData.username}
                            placeholder="username"
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                        />
                    </div>
                </div>

                {!isLogin && (
                  <>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-300">mail</span>
                            <input 
                                required 
                                type="email" 
                                className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                                value={formData.email}
                                placeholder="email@address.com"
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                        <input 
                            required 
                            type="text" 
                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                            value={formData.full_name}
                            placeholder="John Doe"
                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Password</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-300">lock</span>
                        <input 
                            required 
                            type="password" 
                            className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                            value={formData.password}
                            placeholder="••••••••"
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-teal-600 text-white font-black text-sm uppercase tracking-widest py-5 rounded-2xl transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] mt-8"
            >
              {loading ? "Authenticating..." : (isLogin ? "Sign In" : "Create Account")}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-slate-400 font-bold text-sm">
                {isLogin ? "New to LuxeStay?" : "Already have an account?"}{" "}
                <button 
                  onClick={() => { setIsLogin(!isLogin); setError(""); }}
                  className="text-teal-600 font-black hover:underline ml-1"
                >
                  {isLogin ? "Apply Now" : "Sign In"}
                </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
