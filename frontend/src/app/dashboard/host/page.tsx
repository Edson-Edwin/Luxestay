"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL, mediaUrl } from "@/lib/config";
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
  user_details: {
    username: string;
    email: string;
    full_name: string;
    phone_number: string;
  };
  booked_at: string;
}

interface Property {
  id: number;
  title: string;
  location: string;
  is_available: boolean;
  property_type: string;
}

export default function HostDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"bookings" | "properties">("bookings");
  const router = useRouter();

  const fetchData = async () => {
    const token = localStorage.getItem("access");
    if (!token) return;
    try {
      const bookingsRes = await fetch(`${API_URL}/api/properties/bookings/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (bookingsRes.status === 401) {
          localStorage.clear();
          router.push("/auth");
          return;
      }

      const propertiesRes = await fetch(`${API_URL}/api/properties/?host_id=${localStorage.getItem('user_id')}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      const bookingsData = await bookingsRes.json();
      const propertiesData = await propertiesRes.json();

      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setProperties(Array.isArray(propertiesData) ? propertiesData : []);
      setLoading(false);
    } catch (err) {
      console.error("Dashboard error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access");
    const role = localStorage.getItem("role");

    if (!token || role !== "HOST") {
      router.push("/auth");
      return;
    }

    fetchData();
  }, [router]);

  const toggleAvailability = async (propertyId: number, currentStatus: boolean) => {
    const token = localStorage.getItem("access");
    try {
        const res = await fetch(`${API_URL}/api/properties/${propertyId}/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ is_available: !currentStatus })
        });
        if (res.ok) {
            fetchData();
        }
    } catch (err) {
        console.error("Failed to toggle availability:", err);
    }
  };

  const handleDelete = async (propertyId: number) => {
    if (!confirm("Are you sure? This will permanently remove the listing.")) return;
    const token = localStorage.getItem("access");
    try {
        const res = await fetch(`${API_URL}/api/properties/${propertyId}/`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) fetchData();
    } catch (err) {
        console.error("Delete error:", err);
    }
  };

  const confirmBooking = async (bookingId: number) => {
    const token = localStorage.getItem("access");
    try {
        const res = await fetch(`${API_URL}/api/properties/bookings/${bookingId}/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ is_confirmed: true })
        });
        if (res.ok) fetchData();
    } catch (err) {
        console.error("Confirmation error:", err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;

  return (
    <div className="bg-[#f8fafc] min-h-screen font-['Inter'] selection:bg-teal-100 selection:text-teal-900 relative overflow-hidden">
      {/* Background Orbs for Depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-200/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/20 blur-[120px] rounded-full pointer-events-none"></div>

      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Floating Glass Sidebar */}
          <aside className="w-full lg:w-80 lg:sticky lg:top-32 h-fit">
            <div className="glass-card p-8 rounded-[3rem] border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-xl mb-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-400 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-teal-500/20">
                        {localStorage.getItem('username')?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">{localStorage.getItem('username')}</h2>
                        <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest mt-1">Verified Host</p>
                    </div>
                </div>

                <nav className="space-y-1.5">
                    {[
                        { id: 'bookings', label: 'Reservations', icon: 'auto_awesome' },
                        { id: 'properties', label: 'My Sanctuary', icon: 'location_city' }
                    ].map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 ${
                                activeTab === item.id 
                                    ? 'bg-slate-900 text-white shadow-xl translate-x-2' 
                                    : 'text-slate-400 hover:bg-white/50 hover:text-slate-900'
                            }`}
                        >
                            <span className="material-symbols-outlined text-lg">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                    
                    <div className="pt-8 mt-8 border-t border-slate-100 space-y-2">
                        <Link 
                            href="/properties/add"
                            className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-white text-slate-900 border border-slate-100 font-black text-[11px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all group"
                        >
                            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">add</span>
                            New Listing
                        </Link>
                        <button 
                            onClick={() => { localStorage.clear(); router.push("/auth"); }}
                            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-400 font-black text-[11px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                            Sign Out
                        </button>
                    </div>
                </nav>
            </div>

            {/* Quick Support Widget */}
            <div className="p-8 rounded-[3rem] bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-2xl relative overflow-hidden hidden lg:block">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full"></div>
                <h3 className="text-lg font-black tracking-tight mb-2 relative z-10">Need Help?</h3>
                <p className="text-xs text-indigo-100/70 mb-6 relative z-10 leading-relaxed">Our 24/7 Host Concierge is always here for you.</p>
                <button className="w-full py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-indigo-900 transition-all">
                    Contact Desk
                </button>
            </div>
          </aside>

          {/* Main Stage */}
          <div className="flex-1">
            <header className="mb-16">
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{activeTab === 'bookings' ? 'Live Operations' : 'Asset Management'}</span>
                </div>
                <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-4">
                    {activeTab === 'bookings' ? 'Guest Inflow' : 'Property Vault'}
                </h1>
                <p className="text-slate-500 font-medium text-lg max-w-lg">
                    {activeTab === 'bookings' 
                        ? `You have ${bookings.length} reservations currently in the pipeline.` 
                        : `Managing ${properties.length} high-end architectural sanctuaries.`}
                </p>
            </header>

            {activeTab === "bookings" ? (
              <div className="grid gap-8">
                {bookings.length === 0 ? (
                  <div className="py-32 text-center rounded-[4rem] border-2 border-dashed border-slate-200 bg-white/30 backdrop-blur-sm">
                    <span className="material-symbols-outlined text-6xl text-slate-300 mb-6">bedtime</span>
                    <h3 className="text-2xl font-black text-slate-800">Calm Waters</h3>
                    <p className="text-slate-400 mt-2">No active bookings at this moment.</p>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking.id} className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-indigo-500/5 rounded-[4rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-700">
                            <div className="flex flex-col md:flex-row gap-12">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-8">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${booking.is_confirmed ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {booking.is_confirmed ? 'Confirmed' : 'Pending'}
                                        </span>
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{booking.id}</span>
                                    </div>
                                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 leading-tight group-hover:text-teal-600 transition-colors">{booking.property_title}</h3>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">{booking.room_type_name || 'Premium Suite'} • {booking.payment_type} Plan</p>
                                    
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400">
                                            {booking.user_details.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lead Guest</p>
                                            <p className="text-lg font-black text-slate-900">{booking.user_details.full_name || booking.user_details.username}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-80 flex flex-col justify-between">
                                    <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-6">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Check In</p>
                                            <p className="text-xl font-black text-slate-900 tracking-tighter">{new Date(booking.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                        <div className="w-full h-px bg-slate-200"></div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Check Out</p>
                                            <p className="text-xl font-black text-slate-900 tracking-tighter">{booking.check_out ? new Date(booking.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Flexible'}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-8">
                                        {!booking.is_confirmed && (
                                            <button 
                                                onClick={() => confirmBooking(booking.id)}
                                                className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-600 transition-all"
                                            >
                                                Confirm Stay
                                            </button>
                                        )}
                                        <a href={`mailto:${booking.user_details.email}`} className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-teal-600 transition-all">
                                            <span className="material-symbols-outlined">mail</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {properties.map((prop) => (
                  <div key={prop.id} className="bg-white rounded-[3.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 group">
                    <div className="aspect-[16/10] relative overflow-hidden">
                        {(prop as any).image || (prop as any).image_url ? (
                            <img src={mediaUrl((prop as any).image || (prop as any).image_url)} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                        ) : (
                            <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                                <span className="material-symbols-outlined text-6xl">castle</span>
                            </div>
                        )}
                        <div className="absolute top-6 right-6">
                            <button 
                                onClick={() => toggleAvailability(prop.id, prop.is_available)}
                                className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md border transition-all ${
                                    prop.is_available 
                                        ? 'bg-teal-500/90 text-white border-teal-400' 
                                        : 'bg-white/90 text-slate-400 border-white'
                                }`}
                            >
                                {prop.is_available ? 'Live Listing' : 'Paused'}
                            </button>
                        </div>
                    </div>
                    <div className="p-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-teal-600 transition-colors">{prop.title}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{prop.location}</p>
                            </div>
                            <span className="bg-slate-50 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">
                                {prop.property_type.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="flex gap-3 mt-10">
                            <Link 
                                href={`/properties/edit/${prop.id}`}
                                className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-center font-black text-[10px] uppercase tracking-widest hover:bg-teal-600 transition-all"
                            >
                                Edit Details
                            </Link>
                            <button 
                                onClick={() => handleDelete(prop.id)}
                                className="w-14 h-14 rounded-2xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                            >
                                <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
