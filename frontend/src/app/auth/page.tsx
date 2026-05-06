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
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        
        // Fetch profile to get role
        const profileRes = await fetch(`${API_URL}/api/auth/profile/`, {
          headers: { "Authorization": `Bearer ${data.access}` }
        });
        const profile = await profileRes.json();
        localStorage.setItem("role", profile.role);
        localStorage.setItem("user_id", profile.id);
        
        router.push("/");
      } else {
        setIsLogin(true);
        setError("Registration successful! Please login.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex text-on-surface">
      {/* Left side: Beautiful Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-black">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMHaeFauVuldcybGGoLeUM_e3FcTRGrgaYBAykV2WMQ-o-mYI1jda14UArHhZ1ACz4fOSRl1yEvymk9ZKHwPMq8sphYXmyY9mRtXzJq1QfVqZkfcPtXSO00f4SqWUiRbRxuXcV2msxmtiiRAtgjfVBq04HBRdNbA0Qkc0-PEfT58UWn5PDEpquDdBuoSHjyc5hAIwJsWxiCNuVktqAZwHLEZst2XS9S0a0_hkrY89yrv1re1eYtKYKIJ54saJnRCfQ4FF2nqwD0Yc" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          alt="Luxury Stay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-16 left-16 text-white max-w-lg">
          <h1 className="text-5xl font-bold mb-4 font-display">LuxeStay</h1>
          <p className="text-xl opacity-90">Unlock exclusive access to the world's most breathtaking luxury rentals and experiences.</p>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="w-full lg:w-1/2 bg-surface flex items-center justify-center p-8 lg:p-12 relative overflow-y-auto">
        <Link href="/" className="absolute top-8 right-8 text-secondary hover:text-primary transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined">close</span>
        </Link>

        <div className="w-full max-w-md my-12">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-bold text-primary mb-3">
              {isLogin ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-secondary text-lg">
              {isLogin ? "Please enter your details to sign in." : "Start your luxury journey today."}
            </p>
          </div>

          {error && (
            <div className={`p-4 rounded-xl mb-6 text-sm ${error.includes("successful") ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="flex gap-4 mb-4">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, role: "NORMAL"})}
                  className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold ${formData.role === 'NORMAL' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-secondary'}`}
                >
                  I'm a Guest
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, role: "OWNER"})}
                  className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold ${formData.role === 'OWNER' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-secondary'}`}
                >
                  I'm a Host
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-secondary tracking-widest mb-2">USERNAME</label>
              <input 
                required 
                type="text" 
                className="w-full border-b-2 border-outline-variant bg-transparent px-2 py-3 focus:outline-none focus:border-primary transition-colors text-lg"
                value={formData.username}
                placeholder="Enter your username"
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-bold text-secondary tracking-widest mb-2">EMAIL</label>
                  <input 
                    required 
                    type="email" 
                    className="w-full border-b-2 border-outline-variant bg-transparent px-2 py-3 focus:outline-none focus:border-primary transition-colors text-lg"
                    value={formData.email}
                    placeholder="Enter your email"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                {formData.role === 'OWNER' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-secondary tracking-widest mb-2">FULL NAME</label>
                      <input 
                        required 
                        type="text" 
                        className="w-full border-b-2 border-outline-variant bg-transparent px-2 py-3 focus:outline-none focus:border-primary transition-colors text-lg"
                        value={formData.full_name}
                        placeholder="Your full legal name"
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-secondary tracking-widest mb-2">PHONE NUMBER</label>
                      <input 
                        required 
                        type="tel" 
                        className="w-full border-b-2 border-outline-variant bg-transparent px-2 py-3 focus:outline-none focus:border-primary transition-colors text-lg"
                        value={formData.phone_number}
                        placeholder="+1 (555) 000-0000"
                        onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-secondary tracking-widest mb-2">BUSINESS ADDRESS</label>
                      <input 
                        required 
                        type="text" 
                        className="w-full border-b-2 border-outline-variant bg-transparent px-2 py-3 focus:outline-none focus:border-primary transition-colors text-lg"
                        value={formData.address}
                        placeholder="Street, City, Zip Code"
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-secondary tracking-widest mb-2">PASSWORD</label>
              <input 
                required 
                type="password" 
                className="w-full border-b-2 border-outline-variant bg-transparent px-2 py-3 focus:outline-none focus:border-primary transition-colors text-lg"
                value={formData.password}
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-container text-white font-bold text-lg py-4 rounded-2xl transition-all active:scale-[0.98] mt-8 shadow-lg"
            >
              {isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface text-secondary">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => alert("Google OAuth integration pending client credentials configuration")}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                <span className="font-bold text-sm text-slate-700">Google</span>
              </button>
              <button
                type="button"
                onClick={() => alert("Microsoft OAuth integration pending client credentials configuration")}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <img src="https://www.svgrepo.com/show/448234/microsoft.svg" alt="Microsoft" className="w-5 h-5" />
                <span className="font-bold text-sm text-slate-700">Microsoft</span>
              </button>
            </div>
          </div>

          <div className="mt-10 text-center text-secondary">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              className="text-primary font-bold hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
