"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { API_URL } from "@/lib/config";

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
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access");
    const role = localStorage.getItem("role");

    if (!token || role !== "NORMAL") {
      router.push("/auth");
      return;
    }

    fetch(`${API_URL}/api/properties/bookings/`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setBookings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;

  return (
    <div className="bg-white min-h-screen font-['Inter'] selection:bg-teal-100 selection:text-teal-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        {/* Guest Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
            <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 mb-2 block">Travel Itinerary</span>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900">My Journeys</h1>
            </div>
            <div className="flex gap-4">
                <Link 
                    href="/explore"
                    className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] hover:bg-teal-600 transition-all shadow-xl active:scale-95"
                >
                    Find Next Escape
                </Link>
                <button 
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = "/auth";
                    }}
                    className="px-6 py-4 rounded-2xl bg-red-50 text-red-600 font-black text-[11px] uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all"
                >
                    Sign Out
                </button>
            </div>
        </div>

        {/* Travel Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
                { label: "Upcoming Stays", value: bookings.filter(b => b.is_confirmed).length, icon: "luggage", color: "text-teal-600", bg: "bg-teal-50" },
                { label: "Total Bookings", value: bookings.length, icon: "history", color: "text-indigo-600", bg: "bg-indigo-50" },
                { label: "Member Status", value: "Premium Guest", icon: "stars", color: "text-emerald-600", bg: "bg-emerald-50" }
            ].map((stat, i) => (
                <div key={i} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
                    <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <span className="material-symbols-outlined text-xl">{stat.icon}</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                </div>
            ))}
        </div>

        {bookings.length === 0 ? (
            <div className="py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <span className="material-symbols-outlined text-4xl">travel_explore</span>
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2 text-balance">The world is waiting for you</h2>
                <p className="text-slate-400 max-w-sm mx-auto font-medium">Your world-class experiences will appear here once you've confirmed a stay.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {bookings.map((booking) => (
                    <div key={booking.id} className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 group">
                        <div className="flex justify-between items-start mb-10">
                            <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${booking.is_confirmed ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                {booking.is_confirmed ? 'Stay Confirmed' : 'Request Pending'}
                            </span>
                            <span className="text-[10px] font-black text-slate-200 tracking-widest">STAY-00{booking.id}</span>
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-teal-600 transition-colors leading-[1.1] tracking-tight">{booking.property_title}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10">{booking.room_type_name || 'Exclusive Retreat'}</p>

                        <div className="grid grid-cols-2 gap-8 p-6 rounded-[2rem] bg-slate-50 border border-slate-50 mb-8">
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Check In</p>
                                <p className="text-sm font-black text-slate-900 tracking-tight">{new Date(booking.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                <p className="text-sm font-black text-slate-900 tracking-tight">{booking.payment_type}</p>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Booked {new Date(booking.booked_at).toLocaleDateString()}</p>
                            <Link href="/explore" className="flex items-center gap-2 text-teal-600 font-black text-[10px] uppercase tracking-widest hover:gap-4 transition-all">
                                View Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
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
