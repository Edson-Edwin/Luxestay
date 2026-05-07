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
    <div className="bg-slate-50 min-h-screen font-['Inter']">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="flex justify-between items-end mb-16">
            <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-2">My Journeys</h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Managing {bookings.length} Future & Past Stays</p>
            </div>
            <div className="flex gap-4">
                <Link 
                    href="/explore"
                    className="px-8 py-4 rounded-[2rem] bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-teal-600 transition-all shadow-xl"
                >
                    Find Next Escape
                </Link>
                <button 
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = "/auth";
                    }}
                    className="px-6 py-4 rounded-[2rem] bg-red-50 text-red-600 font-black text-[10px] uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all"
                >
                    Logout
                </button>
            </div>
        </div>

        {bookings.length === 0 ? (
            <div className="py-32 text-center bg-white rounded-[4rem] border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <span className="material-symbols-outlined text-4xl">travel_explore</span>
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">No bookings yet</h2>
                <p className="text-slate-400 max-w-sm mx-auto font-medium">Your world-class experiences will appear here once you've confirmed a stay.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {bookings.map((booking) => (
                    <div key={booking.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                        <div className="flex justify-between items-start mb-8">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${booking.is_confirmed ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                {booking.is_confirmed ? 'Confirmed' : 'Pending'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-300">#{booking.id}</span>
                        </div>

                        <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-teal-600 transition-colors leading-tight">{booking.property_title}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">{booking.room_type_name || 'Premium Room'}</p>

                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check In</p>
                                <p className="text-sm font-black text-slate-900">{new Date(booking.check_in).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment</p>
                                <p className="text-sm font-black text-slate-900">{booking.payment_type}</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                            <p className="text-[10px] font-bold text-slate-300">Booked {new Date(booking.booked_at).toLocaleDateString()}</p>
                            <Link href="/explore" className="text-teal-600 font-black text-[10px] uppercase tracking-widest hover:translate-x-1 transition-transform">
                                Details →
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
