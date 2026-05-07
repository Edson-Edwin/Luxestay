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
    <div className="bg-slate-50 min-h-screen font-['Inter']">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Navigation Sidebar */}
          <div className="w-full lg:w-72 space-y-2">
            <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm mb-6">
                <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center text-white text-2xl font-black mb-4 shadow-lg shadow-teal-600/20">
                    {localStorage.getItem('username')?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 mb-1">{localStorage.getItem('username')}</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Premium Host Partner</p>
            </div>

            <button 
                onClick={() => setActiveTab("bookings")}
                className={`w-full text-left px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'bookings' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-white hover:text-slate-900'}`}
            >
                Reservations
            </button>
            <button 
                onClick={() => setActiveTab("properties")}
                className={`w-full text-left px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'properties' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-white hover:text-slate-900'}`}
            >
                My Listings
            </button>
            <Link 
                href="/properties/add"
                className="block w-full text-center px-6 py-4 rounded-2xl bg-teal-600 text-white font-black text-sm uppercase tracking-widest hover:bg-teal-500 transition-all shadow-lg shadow-teal-600/20 mt-12"
            >
                Add Sanctuary
            </Link>
          </div>

          {/* Dynamic Content Area */}
          <div className="flex-1">
            {activeTab === "bookings" ? (
              <div className="space-y-8">
                <div className="flex justify-between items-end mb-12">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-2">Active Reservations</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Managing {bookings.length} Guests</p>
                  </div>
                </div>

                {bookings.length === 0 ? (
                  <div className="py-24 text-center glass rounded-[3rem] border-dashed border-slate-200">
                    <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">event_busy</span>
                    <h3 className="text-2xl font-black text-slate-800">No Reservations Yet</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mt-2">When your properties are booked, they'll appear here with guest details.</p>
                  </div>
                ) : (
                  <div className="grid gap-8">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                        <div className="flex flex-col gap-10">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] ${booking.is_confirmed ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                        {booking.is_confirmed ? 'Confirmed' : 'Pending Acceptance'}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">ID: #00{booking.id}</span>
                                </div>
                                {!booking.is_confirmed && (
                                    <button 
                                        onClick={() => confirmBooking(booking.id)}
                                        className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-600 transition-all"
                                    >
                                        Accept Guest
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-2 group-hover:text-teal-600 transition-colors">{booking.property_title}</h3>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{booking.room_type_name || 'Standard Estate'} • {booking.payment_type} Plan</p>
                                </div>
                                <div className="flex items-center gap-8 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check In</p>
                                        <p className="text-sm font-black text-slate-900">{new Date(booking.check_in).toLocaleDateString()}</p>
                                    </div>
                                    <div className="w-[1px] h-8 bg-slate-200"></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check Out</p>
                                        <p className="text-sm font-black text-slate-900">{booking.check_out ? new Date(booking.check_out).toLocaleDateString() : '—'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Guest Profile</p>
                                    <p className="font-black text-slate-900">{booking.user_details.full_name || booking.user_details.username}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact</p>
                                    <p className="text-sm font-bold text-slate-700">{booking.user_details.email}</p>
                                    <p className="text-sm font-bold text-slate-400">{booking.user_details.phone_number || "No Phone"}</p>
                                </div>
                                <div className="md:text-right">
                                    <a 
                                        href={`mailto:${booking.user_details.email}`}
                                        className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-600 transition-all border border-slate-900"
                                    >
                                        Contact Guest
                                    </a>
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
