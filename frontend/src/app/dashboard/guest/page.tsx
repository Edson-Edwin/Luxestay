"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/config";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Booking {
  id: number;
  property_title: string;
  payment_type: string;
  room_type_name: string;
  check_in: string;
  check_out: string;
  is_confirmed: boolean;
  booked_at: string;
}

export default function GuestDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    const token = localStorage.getItem("access");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/properties/bookings/guest/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;

  return (
    <div className="bg-[#fafbff] min-h-screen font-['Inter'] selection:bg-teal-100 selection:text-teal-900 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-gradient-to-bl from-teal-50/50 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-gradient-to-tr from-indigo-50/50 to-transparent pointer-events-none"></div>
      
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10">
        {/* Travel Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-24">
            <div className="reveal">
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-12 h-[2px] bg-teal-500"></span>
                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-[0.4em]">Member Sanctuary</span>
                </div>
                <h1 className="text-7xl font-black text-slate-900 tracking-tighter mb-6 leading-none">Global <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600">Journeys</span></h1>
                <p className="text-slate-500 font-medium text-xl max-w-md leading-relaxed">
                    Welcome back. You have <span className="text-slate-900 font-bold">{bookings.length} upcoming experiences</span> awaiting your arrival.
                </p>
            </div>
            <div className="flex gap-4">
                <Link 
                    href="/explore"
                    className="px-10 py-6 rounded-[2.5rem] bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] hover:bg-teal-600 transition-all shadow-2xl shadow-slate-900/20 active:scale-95"
                >
                    Discover More
                </Link>
                <button 
                    onClick={() => { localStorage.clear(); window.location.href = "/auth"; }}
                    className="w-20 h-20 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                >
                    <span className="material-symbols-outlined text-2xl">power_settings_new</span>
                </button>
            </div>
        </div>

        {/* Travel Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-24">
            {[
                { label: "Active Stays", value: bookings.filter(b => b.is_confirmed).length, icon: "luggage", color: "text-teal-600", bg: "bg-teal-50" },
                { label: "Travel Points", value: "2,450", icon: "diamond", color: "text-indigo-600", bg: "bg-indigo-50" },
                { label: "Elite Tier", value: "Silver", icon: "workspace_premium", color: "text-emerald-600", bg: "bg-emerald-50" }
            ].map((stat, i) => (
                <div key={i} className="bg-white/60 backdrop-blur-md p-12 rounded-[4rem] border border-white/60 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-700 group">
                    <div className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-[2rem] flex items-center justify-center mb-10 group-hover:rotate-[360deg] transition-transform duration-1000`}>
                        <span className="material-symbols-outlined text-3xl">{stat.icon}</span>
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                </div>
            ))}
        </div>

        {bookings.length === 0 ? (
            <div className="py-40 text-center bg-white/40 backdrop-blur-md rounded-[5rem] border-2 border-dashed border-slate-100">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
                    <span className="material-symbols-outlined text-5xl">explore</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Your passport is empty</h2>
                <p className="text-slate-500 max-w-md mx-auto text-lg font-medium">Adventure is calling. Start your first world-class journey by exploring our hand-vetted sanctuaries.</p>
                <Link href="/explore" className="inline-block mt-12 text-teal-600 font-black text-xs uppercase tracking-[0.3em] hover:gap-6 transition-all border-b-2 border-teal-600 pb-2">
                    Start Exploring <span className="material-symbols-outlined inline-block align-middle ml-2">arrow_right_alt</span>
                </Link>
            </div>
        ) : (
            <div className="space-y-12">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-10">Trip Itinerary</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-indigo-500/10 rounded-[4.5rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <div className="relative bg-white p-12 rounded-[4.5rem] border border-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.02)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 flex flex-col md:flex-row gap-12">
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-10">
                                        <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${booking.is_confirmed ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                            {booking.is_confirmed ? 'Ready for Arrival' : 'In Approval Queue'}
                                        </span>
                                        <span className="text-[10px] font-black text-slate-200 tracking-widest uppercase">ID: {booking.id.toString().padStart(4, '0')}</span>
                                    </div>

                                    <h3 className="text-4xl font-black text-slate-900 mb-4 group-hover:text-teal-600 transition-colors leading-[1.1] tracking-tighter">{booking.property_title}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-12">{booking.room_type_name || 'Signature Suite'} • {booking.payment_type} STAY</p>

                                    <div className="flex items-center gap-4">
                                        <Link href="/explore" className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-teal-600 transition-all shadow-lg">
                                            Stay Profile
                                        </Link>
                                        <button className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:text-indigo-600 transition-all">
                                            <span className="material-symbols-outlined">share</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="w-full md:w-64 space-y-4">
                                    <div className="p-8 rounded-[3rem] bg-slate-50 border border-slate-50 group-hover:bg-white group-hover:shadow-inner transition-all duration-700">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Check In Date</p>
                                        <p className="text-2xl font-black text-slate-900 tracking-tighter">{new Date(booking.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                    <div className="p-8 rounded-[3rem] bg-slate-900 text-white shadow-xl">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Est. Checkout</p>
                                        <p className="text-2xl font-black text-white tracking-tighter">{booking.check_out ? new Date(booking.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Open-Ended'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
