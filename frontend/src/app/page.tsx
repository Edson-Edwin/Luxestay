"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HomePage() {
  const [searchData, setSearchData] = useState({ location: "", keyword: "" });
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.1 }
    );

    revealRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white selection:bg-teal-100 selection:text-teal-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax effect simulation */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop" 
            className="w-full h-full object-cover scale-110"
            alt="Luxury Villa"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-white"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
          <div className="reveal active" ref={(el) => { revealRefs.current[0] = el }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-[0.2em] mb-8">
              Redefining Luxury Rentals
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
              Stay in the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-200">Extraordinary.</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
              Curated collections of the world's most exceptional properties. Designed for the discerning traveler.
            </p>
          </div>

          {/* Search Box */}
          <div className="reveal active delay-300" ref={(el) => { revealRefs.current[1] = el }}>
            <div className="glass p-2 rounded-[2.5rem] shadow-2xl max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-2">
              <div className="flex-1 flex items-center gap-4 px-8 py-4 border-r border-slate-100">
                <span className="material-symbols-outlined text-teal-600 font-bold">location_on</span>
                <input 
                  type="text" 
                  placeholder="Where to next?" 
                  className="bg-transparent border-none outline-none text-slate-900 font-bold placeholder:text-slate-400 w-full"
                  value={searchData.location}
                  onChange={(e) => setSearchData({...searchData, location: e.target.value})}
                />
              </div>
              <div className="flex-1 flex items-center gap-4 px-8 py-4">
                <span className="material-symbols-outlined text-teal-600 font-bold">search</span>
                <input 
                  type="text" 
                  placeholder="Keyword..." 
                  className="bg-transparent border-none outline-none text-slate-900 font-bold placeholder:text-slate-400 w-full"
                  value={searchData.keyword}
                  onChange={(e) => setSearchData({...searchData, keyword: e.target.value})}
                />
              </div>
              <Link 
                href={`/explore?location=${searchData.location}&keyword=${searchData.keyword}`}
                className="bg-slate-900 text-white px-10 py-5 rounded-full font-black text-sm hover:bg-teal-600 transition-all duration-300 shadow-xl shadow-slate-900/20 active:scale-95"
              >
                Search
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
          <span className="text-[10px] font-black uppercase tracking-widest">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent"></div>
        </div>
      </section>

      {/* Mission / Intro Section */}
      <section className="section-padding bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="reveal" ref={(el) => { revealRefs.current[2] = el }}>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 mb-8 leading-[0.95]">
                Beyond <br /> Accommodation. <br />
                <span className="text-teal-600">Pure Inspiration.</span>
              </h2>
              <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
                <p>
                  LuxeStay isn't just a platform; it's a curated gateway to experiences that stay with you forever. We believe that where you stay defines how you feel.
                </p>
                <p>
                  Every property in our collection is hand-vetted for architectural brilliance, interior mastery, and unparalleled location.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-12 mt-16">
                <div>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter mb-2">500+</p>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Curated Villas</p>
                </div>
                <div>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter mb-2">24/7</p>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Concierge Desk</p>
                </div>
              </div>
            </div>
            <div className="reveal relative" ref={(el) => { revealRefs.current[3] = el }}>
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative z-10 group">
                <img 
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  alt="Modern Architecture"
                />
                <div className="absolute inset-0 bg-teal-900/10 mix-blend-overlay"></div>
              </div>
              {/* Decorative Card */}
              <div className="absolute -bottom-10 -left-10 glass p-8 rounded-3xl shadow-2xl z-20 max-w-xs animate-float">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                    <span className="material-symbols-outlined">verified</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">Vetted Quality</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">100% Quality Assurance</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  "The most seamless luxury experience I've ever had. Truly exceptional."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="section-padding bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 reveal" ref={(el) => { revealRefs.current[4] = el }}>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 mb-4 block">Collections</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">Curated Categories</h2>
            </div>
            <Link href="/explore" className="text-sm font-black text-slate-900 flex items-center gap-2 hover:gap-4 transition-all pb-2 border-b-2 border-slate-900 mt-8 md:mt-0">
              Explore All <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Coastal Estates", count: "124 Properties", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2000&auto=format&fit=crop", type: "VILLA" },
              { title: "Mountain Retreats", count: "86 Properties", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop", type: "CABIN" },
              { title: "Urban Penthouses", count: "42 Properties", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop", type: "PRIVATE_ROOM" }
            ].map((item, i) => (
              <Link key={i} href={`/explore?property_type=${item.type}`} className="reveal group cursor-pointer" ref={(el) => { revealRefs.current[5 + i] = el }}>
                <div className="aspect-[3/4] rounded-[2rem] overflow-hidden relative mb-6 shadow-lg">
                  <img src={item.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={item.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-8 left-8 text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-teal-400">{item.count}</p>
                    <h3 className="text-2xl font-black tracking-tight">{item.title}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-900 rounded-[4rem] p-12 md:p-24 relative overflow-hidden text-center reveal" ref={(el) => { revealRefs.current[8] = el }}>
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-8">
                Ready for your next <br />
                <span className="text-teal-400 italic">masterpiece?</span>
              </h2>
              <p className="text-white/60 text-lg max-w-xl mx-auto mb-12">
                Join our exclusive community and get access to early bookings and off-market premium listings.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/explore" className="bg-teal-500 text-white px-10 py-5 rounded-full font-black text-sm hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/20">
                  Explore Collection
                </Link>
                <Link href="/auth" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-full font-black text-sm hover:bg-white/20 transition-all">
                  Join LuxeStay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
