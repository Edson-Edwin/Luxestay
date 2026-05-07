"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { API_URL, mediaUrl } from "@/lib/config";

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone_number: string;
}

interface Property {
  id: number;
  title: string;
  description: string;
  property_type: string;
  price_per_night: string;
  price_per_day: string;
  price_per_month: string;
  allows_nightly: boolean;
  allows_daily: boolean;
  allows_monthly: boolean;
  location: string;
  image: string | null;
  image_url: string | null;
  host_username: string;
  host_details: User | null;
  amenities: string[];
  advance_payment_amount: string;
  is_available: boolean;
  images: {
    id: number;
    image: string;
  }[];
  room_types: {
    id: number;
    name: string;
    price_per_night: string;
    price_per_day: string;
    price_per_month: string;
  }[];
}

export default function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [ownerDetails, setOwnerDetails] = useState<User | null>(null);
  const [paymentType, setPaymentType] = useState<string>("NIGHTLY");
  const [selectedRoomType, setSelectedRoomType] = useState<number | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/api/properties/${id}/`)
      .then(res => {
        if (!res.ok) throw new Error("Property not found");
        return res.json();
      })
      .then(data => {
        setProperty(data);
        if (data.allows_nightly) setPaymentType("NIGHTLY");
        else if (data.allows_daily) setPaymentType("DAILY");
        else if (data.allows_monthly) setPaymentType("MONTHLY");
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleBookNow = async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      router.push("/auth");
      return;
    }

    if (!checkIn) {
      alert("Please select a date.");
      return;
    }

    if (paymentType === "DAILY" && !checkOut) {
      alert("Please select an end date.");
      return;
    }
    
    if (confirm(`Confirm advance payment of $${property?.advance_payment_amount} to secure this booking?`)) {
        try {
            const res = await fetch(`${API_URL}/api/properties/bookings/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    property: id,
                    payment_type: paymentType,
                    room_type: selectedRoomType,
                    check_in: checkIn,
                    check_out: paymentType === "DAILY" ? checkOut : null
                })
            });
            const data = await res.json();
            if (res.ok && property) {
                setBookingSuccess(true);
                setOwnerDetails(property.host_details);
            } else {
                alert(data.detail || "Booking failed.");
            }
        } catch (err) {
            console.error("Booking error:", err);
            alert("An error occurred during booking.");
        }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;
  if (error || !property) return <div className="min-h-screen flex items-center justify-center text-red-500 bg-slate-50">{error || "Property not found."}</div>;

  const getPriceForType = (type: string) => {
    let basePrice = "0.00";
    const room = property.room_types.find(rt => rt.id === selectedRoomType);
    if (type === "NIGHTLY") basePrice = room?.price_per_night || property.price_per_night;
    if (type === "DAILY") basePrice = room?.price_per_day || property.price_per_day;
    if (type === "MONTHLY") basePrice = room?.price_per_month || property.price_per_month;
    return basePrice;
  };

  const getLabel = () => {
    if (paymentType === "NIGHTLY") return "/ night";
    if (paymentType === "DAILY") return "/ day";
    if (paymentType === "MONTHLY") return "/ month";
    return "/ night";
  };

  const allImages = [
    ...(property.image ? [mediaUrl(property.image)] : []),
    ...(property.image_url ? [mediaUrl(property.image_url)] : []),
    ...(property.images?.map(img => mediaUrl(img.image)) || [])
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-['Inter']">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-4 mb-8 text-slate-400 font-bold text-xs uppercase tracking-widest">
            <Link href="/" className="hover:text-teal-600">Home</Link>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <Link href="/explore" className="hover:text-teal-600">Explore</Link>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-slate-900">{property.title}</span>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-end gap-6 mb-12">
            <div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 mb-4">{property.title}</h1>
                <p className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-tight">
                    <span className="material-symbols-outlined text-teal-600">location_on</span>
                    {property.location} • <span className="text-teal-600">{property.property_type.replace('_', ' ')}</span>
                </p>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 px-4 py-1.5 bg-teal-50 rounded-full border border-teal-100">
                    Premium Listing
                </span>
            </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16 h-[500px]">
            <div className="md:col-span-2 md:row-span-2 rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
                <img src={allImages[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="" />
            </div>
            {allImages.slice(1, 5).map((img, i) => (
                <div key={i} className="hidden md:block rounded-[1.5rem] overflow-hidden shadow-lg relative group">
                    <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                    {i === 3 && allImages.length > 5 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white cursor-pointer hover:bg-black/50 transition-colors">
                            <span className="font-black text-lg">+{allImages.length - 5} More</span>
                        </div>
                    )}
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2">
                <div className="flex items-center justify-between pb-8 border-b border-slate-100 mb-10">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1">Hosted by {property.host_username}</h2>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Premium Collection Host</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center text-white text-2xl font-black">
                        {property.host_username[0].toUpperCase()}
                    </div>
                </div>

                <div className="mb-16">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-teal-600 mb-6">About the Estate</h3>
                    <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">{property.description}</p>
                </div>

                <div className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm mb-16">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-teal-600 mb-10">World-Class Amenities</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {property.amenities?.map(amt => {
                            const amenityMap: any = {
                                wifi: { label: 'Fast WiFi', icon: 'wifi' },
                                kitchen: { label: 'Kitchen', icon: 'kitchen' },
                                ac: { label: 'Air conditioning', icon: 'ac_unit' },
                                pool: { label: 'Private pool', icon: 'pool' },
                                parking: { label: 'Free parking', icon: 'local_parking' },
                                gym: { label: 'Gym', icon: 'fitness_center' },
                                tv: { label: 'TV', icon: 'tv' },
                                workspace: { label: 'Dedicated workspace', icon: 'laptop_mac' },
                            };
                            const item = amenityMap[amt];
                            if (!item) return null;
                            return (
                                <div key={amt} className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-teal-600">
                                        <span className="material-symbols-outlined">{item.icon}</span>
                                    </div>
                                    <span className="font-bold text-slate-700">{item.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1">
                <div className="glass p-10 rounded-[3rem] shadow-2xl border-slate-200/50 sticky top-32">
                    {bookingSuccess ? (
                        <div className="text-center py-6">
                            <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center text-white mb-6 mx-auto shadow-xl shadow-teal-500/20">
                                <span className="material-symbols-outlined text-4xl">verified</span>
                            </div>
                            <h3 className="text-3xl font-black tracking-tight text-slate-900 mb-4">Confirmed!</h3>
                            <p className="text-slate-500 text-sm mb-8">Your sanctuary awaits. We've sent the details to your email.</p>
                            <div className="space-y-4 p-6 bg-slate-50 rounded-3xl text-left border border-slate-100">
                                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Host Details</p>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{ownerDetails?.full_name || property.host_username}</p>
                                    <p className="text-xs text-slate-500">{ownerDetails?.email}</p>
                                    <p className="text-xs text-slate-500 mt-1">{ownerDetails?.phone_number || "No phone provided"}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-end gap-2 mb-10">
                                <span className="text-4xl font-black text-slate-900 tracking-tight">${getPriceForType(paymentType)}</span>
                                <span className="text-slate-400 font-bold mb-1.5 uppercase text-[10px] tracking-widest">{getLabel()}</span>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Accommodation Type</p>
                                    <select 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-sm text-slate-900 outline-none focus:border-teal-500 transition-all appearance-none"
                                        value={selectedRoomType || ""}
                                        onChange={(e) => setSelectedRoomType(e.target.value ? Number(e.target.value) : null)}
                                    >
                                        <option value="">Standard Property</option>
                                        {property.room_types.map(rt => (
                                            <option key={rt.id} value={rt.id}>{rt.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Dates</p>
                                    <div className="grid grid-cols-1 gap-4">
                                        <input 
                                            type="date" 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-sm text-slate-900 outline-none focus:border-teal-500 transition-all"
                                            value={checkIn}
                                            onChange={(e) => setCheckIn(e.target.value)}
                                        />
                                        {paymentType === "DAILY" && (
                                            <input 
                                                type="date" 
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-sm text-slate-900 outline-none focus:border-teal-500 transition-all"
                                                value={checkOut}
                                                onChange={(e) => setCheckOut(e.target.value)}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Payment Plan</p>
                                    <div className="flex gap-2">
                                        {["NIGHTLY", "DAILY", "MONTHLY"].map(plan => {
                                            if (plan === "NIGHTLY" && !property.allows_nightly) return null;
                                            if (plan === "DAILY" && !property.allows_daily) return null;
                                            if (plan === "MONTHLY" && !property.allows_monthly) return null;
                                            return (
                                                <button 
                                                    key={plan}
                                                    onClick={() => setPaymentType(plan)}
                                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${paymentType === plan ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-100 hover:border-teal-200'}`}
                                                >
                                                    {plan}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-slate-100">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Advance Payment</span>
                                    <span className="text-2xl font-black text-slate-900">${property.advance_payment_amount}</span>
                                </div>
                                <button 
                                    onClick={handleBookNow}
                                    disabled={!property.is_available}
                                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-teal-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {property.is_available ? "Confirm Reservation" : "Currently Unavailable"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
