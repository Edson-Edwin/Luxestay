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
    <div className="bg-white min-h-screen font-['Inter'] selection:bg-teal-100 selection:text-teal-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
            <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 mb-2 block">Host Control Center</span>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">{localStorage.getItem('username')}</span>
                </h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Platform Status: Optimal</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined">notifications</span>
                </div>
            </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
                { label: "Total Revenue", value: `$${(bookings.length * 450).toLocaleString()}`, icon: "payments", color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Active Bookings", value: bookings.length, icon: "calendar_today", color: "text-teal-600", bg: "bg-teal-50" },
                { label: "Total Listings", value: properties.length, icon: "villa", color: "text-indigo-600", bg: "bg-indigo-50" }
            ].map((stat, i) => (
                <div key={i} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
                    <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                </div>
            ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Refined Sidebar */}
          <div className="w-full lg:w-80 space-y-3">
            <div className="p-8 rounded-[3rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 blur-3xl rounded-full"></div>
                <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-black mb-6">
                        {localStorage.getItem('username')?.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-xl font-black tracking-tight mb-1">{localStorage.getItem('username')}</h2>
                    <p className="text-[9px] font-black text-teal-400 uppercase tracking-[0.2em]">Verified Elite Host</p>
                </div>
            </div>

            <nav className="space-y-2">
                <button 
                    onClick={() => setActiveTab("bookings")}
                    className={`w-full flex items-center gap-4 px-8 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'bookings' ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                    <span className="material-symbols-outlined text-lg">event_available</span>
                    Reservations
                </button>
                <button 
                    onClick={() => setActiveTab("properties")}
                    className={`w-full flex items-center gap-4 px-8 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'properties' ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                    <span className="material-symbols-outlined text-lg">domain</span>
                    Management
                </button>
                <Link 
                    href="/properties/add"
                    className="w-full flex items-center gap-4 px-8 py-5 rounded-[2rem] bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest hover:bg-teal-600 transition-all shadow-xl mt-12"
                >
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    List New Sanctuary
                </Link>
                <button 
                    onClick={() => {
                        localStorage.clear();
                        router.push("/auth");
                    }}
                    className="w-full flex items-center gap-4 px-8 py-5 rounded-[2rem] text-red-500 font-black text-[11px] uppercase tracking-widest hover:bg-red-50 transition-all mt-4"
                >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    Sign Out
                </button>
            </nav>
          </div>

          {/* Dynamic Content Area */}
          <div className="flex-1">
            {activeTab === "bookings" ? (
              <div className="space-y-10">
                <div className="flex justify-between items-center pb-8 border-b border-slate-100">
                    <h2 className="text-3xl font-black tracking-tighter text-slate-900">Live Reservations</h2>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Real-time Sync</span>
                    </div>
                </div>

                {bookings.length === 0 ? (
                  <div className="py-32 text-center rounded-[4rem] border-2 border-dashed border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <span className="material-symbols-outlined text-4xl">bedtime</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">Quiet Moment</h3>
                    <p className="text-slate-400 max-w-xs mx-auto mt-2 font-medium">Your sanctuaries are waiting for their next distinguished guests.</p>
                  </div>
                ) : (
                  <div className="grid gap-10">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-700 group">
                        <div className="flex flex-col gap-12">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${booking.is_confirmed ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                        {booking.is_confirmed ? 'Confirmed' : 'Pending Verification'}
                                    </span>
                                    <span className="text-[11px] font-black text-slate-300 tracking-widest">RES-00{booking.id}</span>
                                </div>
                                {!booking.is_confirmed && (
                                    <button 
                                        onClick={() => confirmBooking(booking.id)}
                                        className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-teal-600 transition-all shadow-lg active:scale-95"
                                    >
                                        Authorize Stay
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                <div>
                                    <h3 className="text-3xl font-black tracking-tight text-slate-900 mb-3 group-hover:text-teal-600 transition-colors leading-none">{booking.property_title}</h3>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{booking.room_type_name || 'Executive Suite'} • {booking.payment_type} Membership</p>
                                </div>
                                <div className="grid grid-cols-2 gap-8 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Check In</p>
                                        <p className="text-lg font-black text-slate-900 tracking-tighter">{new Date(booking.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Check Out</p>
                                        <p className="text-lg font-black text-slate-900 tracking-tighter">{booking.check_out ? new Date(booking.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Flexible'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black">
                                        {booking.user_details.username[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lead Guest</p>
                                        <p className="text-xl font-black text-slate-900 tracking-tight">{booking.user_details.full_name || booking.user_details.username}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <a 
                                        href={`mailto:${booking.user_details.email}`}
                                        className="flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all border border-slate-100"
                                    >
                                        <span className="material-symbols-outlined text-lg">mail</span>
                                        Contact
                                    </a>
                                    <button className="p-4 rounded-2xl bg-slate-50 text-slate-400 hover:text-teal-600 transition-all">
                                        <span className="material-symbols-outlined">more_vert</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex justify-between items-end mb-12">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-2">My Listings</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Managing {properties.length} Active Sanctuaries</p>
                  </div>
                </div>

                <div className="grid gap-6">
                    {properties.map((prop) => (
                        <div key={prop.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 group hover:shadow-xl transition-all">
                            <div className="flex items-center gap-8 w-full md:w-auto">
                                <div className="w-24 h-24 rounded-[2rem] bg-slate-50 overflow-hidden shadow-inner border border-slate-100">
                                    {(prop as any).image || (prop as any).image_url ? (
                                        <img src={mediaUrl((prop as any).image || (prop as any).image_url)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <span className="material-symbols-outlined text-4xl">villa</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-teal-600 transition-colors">{prop.title}</h3>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{prop.location}</p>
                                    <span className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-500 border border-slate-100">
                                        {prop.property_type.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-8 w-full md:w-auto justify-between border-t md:border-t-0 pt-6 md:pt-0">
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className={`text-xs font-black uppercase tracking-widest ${prop.is_available ? 'text-teal-600' : 'text-red-400'}`}>
                                            {prop.is_available ? 'Live' : 'Hidden'}
                                        </p>
                                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Visibility</p>
                                    </div>
                                    <button 
                                        onClick={() => toggleAvailability(prop.id, prop.is_available)}
                                        className={`w-14 h-8 rounded-full relative transition-all duration-500 ${prop.is_available ? 'bg-teal-600' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-500 ${prop.is_available ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                </div>
                                <div className="flex gap-3">
                                    <Link 
                                        href={`/properties/edit/${prop.id}`}
                                        className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-lg">edit</span>
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(prop.id)}
                                        className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
