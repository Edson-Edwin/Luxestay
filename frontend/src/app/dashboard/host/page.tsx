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
        if (res.ok) fetchData();
    } catch (err) {
        console.error("Failed to toggle availability:", err);
    }
  };

  const handleDelete = async (propertyId: number) => {
    if (!confirm("Are you sure? This listing will be removed.")) return;
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div></div>;

  return (
    <div className="bg-slate-50 min-h-screen font-['Inter']">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Professional Sidebar */}
          <aside className="w-full lg:w-64 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-xl">
                        {localStorage.getItem('username')?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 leading-tight">{localStorage.getItem('username')}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Host Dashboard</p>
                    </div>
                </div>

                <nav className="space-y-1">
                    <button 
                        onClick={() => setActiveTab("bookings")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'bookings' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                        <span className="material-symbols-outlined text-lg">calendar_month</span>
                        Reservations
                    </button>
                    <button 
                        onClick={() => setActiveTab("properties")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'properties' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                        <span className="material-symbols-outlined text-lg">apartment</span>
                        My Listings
                    </button>
                </nav>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <Link 
                    href="/properties/add"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-all"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    Add Property
                </Link>
                <button 
                    onClick={() => { localStorage.clear(); router.push("/auth"); }}
                    className="w-full py-3 text-red-600 text-sm font-bold hover:bg-red-50 rounded-xl transition-all"
                >
                    Sign Out
                </button>
            </div>
          </aside>

          {/* Neat Content Area */}
          <main className="flex-1 space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">
                    {activeTab === "bookings" ? "Recent Reservations" : "Property Management"}
                </h1>
                <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Welcome Back</p>
                    <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {activeTab === "bookings" ? (
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="bg-white p-20 text-center rounded-2xl border border-slate-200 border-dashed">
                    <p className="text-slate-400 font-medium">No reservations found yet.</p>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking.id} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-500 transition-all">
                        <div className="flex flex-col md:flex-row justify-between gap-8">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${booking.is_confirmed ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                        {booking.is_confirmed ? 'Confirmed' : 'Pending Approval'}
                                    </span>
                                    <span className="text-xs text-slate-400">#RES-{booking.id}</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{booking.property_title}</h3>
                                    <p className="text-sm text-slate-500">{booking.room_type_name} • {booking.payment_type} Stay</p>
                                </div>
                                <div className="flex items-center gap-4 pt-2">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                                        {booking.user_details.username[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{booking.user_details.full_name || booking.user_details.username}</p>
                                        <p className="text-xs text-slate-400">{booking.user_details.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-64 space-y-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Check In</p>
                                        <p className="text-sm font-bold text-slate-900">{new Date(booking.check_in).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Check Out</p>
                                        <p className="text-sm font-bold text-slate-900">{booking.check_out ? new Date(booking.check_out).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                </div>
                                {!booking.is_confirmed && (
                                    <button 
                                        onClick={() => confirmBooking(booking.id)}
                                        className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-teal-600 transition-all"
                                    >
                                        Confirm Reservation
                                    </button>
                                )}
                                <a href={`mailto:${booking.user_details.email}`} className="block text-center w-full py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
                                    Contact Guest
                                </a>
                            </div>
                        </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {properties.map((prop) => (
                  <div key={prop.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                    <div className="aspect-video relative bg-slate-100">
                        {(prop as any).image || (prop as any).image_url ? (
                            <img src={mediaUrl((prop as any).image || (prop as any).image_url)} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <span className="material-symbols-outlined text-4xl">image</span>
                            </div>
                        )}
                        <div className="absolute top-4 right-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${prop.is_available ? 'bg-teal-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                                {prop.is_available ? 'Active' : 'Hidden'}
                            </span>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 leading-tight">{prop.title}</h3>
                            <p className="text-sm text-slate-400">{prop.location}</p>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Link 
                                href={`/properties/edit/${prop.id}`}
                                className="flex-1 py-3 bg-slate-100 text-slate-900 rounded-xl text-center text-sm font-bold hover:bg-slate-200 transition-all"
                            >
                                Edit
                            </Link>
                            <button 
                                onClick={() => toggleAvailability(prop.id, prop.is_available)}
                                className="px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
                                title="Toggle Visibility"
                            >
                                <span className="material-symbols-outlined text-lg">{prop.is_available ? 'visibility_off' : 'visibility'}</span>
                            </button>
                            <button 
                                onClick={() => handleDelete(prop.id)}
                                className="px-4 py-3 border border-slate-200 text-red-500 rounded-xl hover:bg-red-50 transition-all"
                                title="Delete Listing"
                            >
                                <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
