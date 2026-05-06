"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/config";

interface Booking {
  id: number;
  property_title: string;
  payment_type: string;
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

export default function OwnerDashboard() {
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

    if (!token || role !== "OWNER") {
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
            // Refresh data
            fetchData();
        }
    } catch (err) {
        console.error("Failed to toggle availability:", err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="bg-surface text-on-surface min-h-screen font-['Inter']">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-primary tracking-tighter">LuxeStay</Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Home</Link>
            <Link href="/properties/add" className="bg-primary text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-primary-container transition-all">Add Property</Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <div className="w-full lg:w-64 space-y-2">
            <h2 className="text-sm font-bold text-slate-400 tracking-widest px-4 mb-4">OWNER DASHBOARD</h2>
            <button 
                onClick={() => setActiveTab("bookings")}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'bookings' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                Manage Bookings
            </button>
            <button 
                onClick={() => setActiveTab("properties")}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'properties' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                My Properties
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium">Earnings</button>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "bookings" ? (
              <>
                <div className="mb-10">
                  <h1 className="text-4xl font-bold text-slate-900 mb-2">Recent Bookings</h1>
                  <p className="text-slate-500">You have {bookings.length} total bookings across your properties.</p>
                </div>

                {bookings.length === 0 ? (
                  <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-slate-200">
                    <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">calendar_today</span>
                    <h3 className="text-xl font-bold text-slate-800">No bookings yet</h3>
                    <p className="text-slate-500">When someone books your property, it will appear here.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between gap-8">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">Booked</span>
                                <span className="text-sm text-slate-400">{new Date(booking.booked_at).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-6">{booking.property_title}</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 tracking-widest mb-1">GUEST NAME</label>
                                    <p className="text-lg font-bold text-slate-800">{booking.user_details.full_name || booking.user_details.username}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 tracking-widest mb-1">GUEST EMAIL</label>
                                    <p className="text-lg font-bold text-slate-800">{booking.user_details.email}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 tracking-widest mb-1">PHONE NUMBER</label>
                                    <p className="text-lg font-bold text-slate-800">{booking.user_details.phone_number || "Not provided"}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 tracking-widest mb-1">PAYMENT PLAN</label>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
                                        <p className="text-lg font-bold text-primary uppercase tracking-tight">{booking.payment_type}</p>
                                    </div>
                                </div>
                                <div>
                                    <button className="flex items-center gap-2 text-slate-600 font-bold hover:text-primary transition-colors hover:underline">
                                        <span className="material-symbols-outlined text-[18px]">mail</span>
                                        Send Message
                                    </button>
                                </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="mb-10">
                  <h1 className="text-4xl font-bold text-slate-900 mb-2">My Properties</h1>
                  <p className="text-slate-500">Manage visibility and status of your listings.</p>
                </div>

                <div className="grid gap-6">
                    {properties.map((prop) => (
                        <div key={prop.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-slate-400">home</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{prop.title}</h3>
                                    <p className="text-sm text-slate-500">{prop.location}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-wider">{prop.property_type.replace('_', ' ')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className={`text-sm font-bold ${prop.is_available ? 'text-green-600' : 'text-error'}`}>
                                        {prop.is_available ? 'Available' : 'Not Available'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">CURRENT STATUS</p>
                                </div>
                                <button 
                                    onClick={() => toggleAvailability(prop.id, prop.is_available)}
                                    className={`w-14 h-8 rounded-full relative transition-colors ${prop.is_available ? 'bg-primary' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${prop.is_available ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>
                    ))}
                    {properties.length === 0 && (
                        <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-slate-200">
                            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">add_home</span>
                            <h3 className="text-xl font-bold text-slate-800">No properties listed</h3>
                            <p className="text-slate-500 mb-6">List your first property to start hosting.</p>
                            <Link href="/properties/add" className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-full">Add Property</Link>
                        </div>
                    )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
