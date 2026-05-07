"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    setIsLoggedIn(!!localStorage.getItem("access"));
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      scrolled ? "py-4 glass shadow-lg" : "py-6 bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-teal-600/20">
            <span className="material-symbols-outlined font-bold">villa</span>
          </div>
          <span className={`text-2xl font-black tracking-tighter transition-colors ${
            scrolled || pathname !== "/" ? "text-slate-900" : "text-white"
          }`}>
            LuxeStay
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {["Home", "Explore"].map((item) => (
            <Link 
              key={item} 
              href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
              className={`text-sm font-bold tracking-tight hover:text-teal-600 transition-colors ${
                scrolled || pathname !== "/" ? "text-slate-600" : "text-white/80 hover:text-white"
              }`}
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link 
                href={
                  localStorage.getItem("role") === "HOST" ? "/dashboard/host" :
                  localStorage.getItem("role") === "ADMIN" ? "/dashboard/admin" :
                  "/dashboard/guest"
                }
                className={`px-6 py-2.5 rounded-full text-sm font-black transition-all ${
                  scrolled || pathname !== "/" 
                    ? "bg-slate-900 text-white hover:bg-slate-800" 
                    : "bg-white text-slate-900 hover:bg-teal-50 shadow-lg"
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href="/profile"
                className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all border-2 ${
                  scrolled || pathname !== "/" 
                    ? "bg-slate-50 border-slate-200 text-slate-600 hover:border-teal-600 hover:text-teal-600" 
                    : "bg-white/10 border-white/20 text-white hover:bg-white hover:text-slate-900"
                }`}
                title="Edit Profile"
              >
                {localStorage.getItem("username")?.[0].toUpperCase()}
              </Link>
            </div>
          ) : (
            <Link 
              href="/auth"
              className={`px-6 py-2.5 rounded-full text-sm font-black transition-all ${
                scrolled || pathname !== "/" 
                  ? "bg-slate-900 text-white hover:bg-slate-800" 
                  : "bg-white text-slate-900 hover:bg-teal-50 shadow-lg"
              }`}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
