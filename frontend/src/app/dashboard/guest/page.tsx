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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div></div>;

  return (
    <div className="bg-slate-50 min-h-screen font-['Inter']">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 space-y-8">
        {/* Simple Header */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">My Journeys</h1>
                <p className="text-sm text-slate-500">Managing your {bookings.length} upcoming and past stays.</p>
            </div>
            <div className="flex gap-3">
                <Link 
                    href="/explore"
                    className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-teal-600 transition-all shadow-sm active:scale-95"
                >
                    Find New Escape
                </Link>
                <button 
                    onClick={() => { localStorage.clear(); window.location.href = "/auth"; }}
                    className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                >
                    Sign Out
                </button>
            </div>
        </div>

        {/* Clean Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { label: "Active Bookings", value: bookings.filter(b => b.is_confirmed).length, icon: "luggage", color: "text-teal-600" },
                { label: "Total Stays", value: bookings.length, icon: "history", color: "text-indigo-600" },
                { label: "Member Since", value: "May 2026", icon: "calendar_today", color: "text-slate-500" }
            ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <span className={`material-symbols-outlined text-2xl ${stat.color}`}>{stat.icon}</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>

        {bookings.length === 0 ? (
            <div className="py-32 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
                <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">explore</span>
                <h2 className="text-xl font-bold text-slate-800 mb-2">No bookings yet</h2>
                <p className="text-slate-400 max-w-sm mx-auto">Your world-class experiences will appear here once you've confirmed a stay.</p>
                <Link href="/explore" className="inline-block mt-8 text-teal-600 font-bold text-sm hover:underline">
                    Explore Properties →
                </Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map((booking) => (
                    <div key={booking.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-500 transition-all flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${booking.is_confirmed ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                    {booking.is_confirmed ? 'Stay Confirmed' : 'Waiting Approval'}
                                </span>
                                <span className="text-xs text-slate-300">#RES-{booking.id}</span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 leading-tight">{booking.property_title}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{booking.room_type_name || 'Executive Room'}</p>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Check In</p>
                                    <p className="text-sm font-bold text-slate-900">{new Date(booking.check_in).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Type</p>
                                    <p className="text-sm font-bold text-slate-900">{booking.payment_type}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Booked {new Date(booking.booked_at).toLocaleDateString()}</p>
                            <Link href="/explore" className="text-teal-600 font-bold text-xs hover:underline">
                                Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
