"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";

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
  host_details: any;
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
  const [ownerDetails, setOwnerDetails] = useState<any>(null);
  const [paymentType, setPaymentType] = useState<string>("NIGHTLY");
  const [selectedRoomType, setSelectedRoomType] = useState<number | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    fetch(`http://localhost:8000/api/properties/${id}/`)
      .then(res => {
        if (!res.ok) throw new Error("Property not found");
        return res.json();
      })
      .then(data => {
        setProperty(data);
        // Set default payment type based on what's allowed
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
            const res = await fetch("http://localhost:8000/api/properties/bookings/", {
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
            if (res.ok) {
                setBookingSuccess(true);
                setOwnerDetails(property?.host_details);
            } else {
                alert(data.detail || "Booking failed.");
            }
        } catch (err) {
            console.error("Booking error:", err);
            alert("An error occurred during booking.");
        }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-surface"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (error || !property) return <div className="min-h-screen flex items-center justify-center text-error bg-surface">{error || "Property not found."}</div>;

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
    ...(property.image ? [property.image] : []),
    ...(property.image_url ? [property.image_url] : []),
    ...(property.images?.map(img => img.image) || [])
  ];

  return (
    <div className="bg-surface text-on-surface min-h-screen font-['Inter']">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/explore" className="flex items-center gap-2 text-primary font-semibold hover:underline">
            <span className="material-symbols-outlined">arrow_back</span> Back to Explore
          </Link>
          <span className="text-2xl font-black text-primary tracking-tighter">LuxeStay</span>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold mb-6 tracking-tight">{property.title}</h1>
        
        <div className="space-y-4 mb-8">
            <div className="aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl border border-slate-100 relative group">
                {allImages.length > 0 ? (
                    <>
                        <img 
                            src={allImages[activeImageIndex]} 
                            className="w-full h-full object-cover transition-all duration-700"
                            alt={property.title}
                        />
                        {allImages.length > 1 && (
                            <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                                    className="w-12 h-12 rounded-full bg-white/90 shadow-xl flex items-center justify-center text-primary hover:bg-white active:scale-90 transition-all"
                                >
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <button 
                                    onClick={() => setActiveImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                                    className="w-12 h-12 rounded-full bg-white/90 shadow-xl flex items-center justify-center text-primary hover:bg-white active:scale-90 transition-all"
                                >
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-6xl">image_not_supported</span>
                    </div>
                )}
            </div>
            
            {allImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {allImages.map((img, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setActiveImageIndex(idx)}
                            className={`flex-shrink-0 w-24 aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                            <img src={img} className="w-full h-full object-cover" alt="" />
                        </button>
                    ))}
                </div>
            )}
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8 pb-8 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-bold mb-1 text-slate-800">{property.property_type.replace('_', ' ')} hosted by {property.host_username}</h2>
                <p className="text-slate-500 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span> {property.location}
                </p>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-xl font-bold mb-4 text-slate-800">About this space</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg">{property.description}</p>
            </div>
            
            <div className="mb-10 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">verified</span> Amenities
              </h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-slate-600">
                {property.amenities && property.amenities.length > 0 ? (
                  property.amenities.map((amt: string) => {
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
                        <div key={amt} className="flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                <span className="material-symbols-outlined text-primary">{item.icon}</span> 
                            </div>
                            <span className="text-sm font-bold text-slate-700">{item.label}</span>
                        </div>
                    );
                  })
                ) : (
                    <p className="text-slate-400 italic text-sm">No specific amenities listed by the host.</p>
                )}
              </div>
            </div>
          </div>

          <div className="w-full md:w-[420px]">
            <div className="bg-white p-8 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-100 sticky top-24">
              <div className="flex items-end gap-2 mb-8">
                <span className="text-4xl font-black text-slate-900 tracking-tight">${getPriceForType(paymentType)}</span>
                <span className="text-slate-400 font-bold mb-1.5 uppercase text-xs tracking-widest">{getLabel()}</span>
              </div>

              {bookingSuccess ? (
                <div className="bg-green-50 text-green-800 p-6 rounded-2xl border border-green-100">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg shadow-green-200">
                    <span className="material-symbols-outlined text-white text-3xl">check</span>
                  </div>
                  <h3 className="font-black text-2xl mb-4 text-center tracking-tight">Booking Confirmed!</h3>
                  <div className="space-y-4 pt-6 border-t border-green-100">
                    <p className="text-[10px] font-black text-green-700 uppercase tracking-[0.2em]">Host Contact Details</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider mb-1">NAME</p>
                            <p className="text-sm font-bold text-green-900">{ownerDetails?.full_name || property.host_username}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider mb-1">PHONE</p>
                            <p className="text-sm font-bold text-green-900">{ownerDetails?.phone_number || "N/A"}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider mb-1">EMAIL</p>
                        <p className="text-sm font-bold text-green-900">{ownerDetails?.email}</p>
                    </div>
                  </div>
                </div>
              ) : (
                 <>
                  {!property.is_available && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 mb-8 flex items-start gap-3">
                        <span className="material-symbols-outlined text-red-500">lock</span>
                        <div>
                            <p className="font-black text-xs uppercase tracking-wider">Unavailable</p>
                            <p className="text-xs font-medium opacity-80">Host is not accepting new bookings.</p>
                        </div>
                    </div>
                  )}

                  <div className="space-y-6 mb-8">
                    {property.room_types && property.room_types.length > 0 && (
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Select Room Type</p>
                            <div className="grid grid-cols-1 gap-3">
                                {property.room_types.map((rt) => (
                                    <button 
                                        key={rt.id}
                                        onClick={() => setSelectedRoomType(rt.id)}
                                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${selectedRoomType === rt.id ? 'border-primary bg-primary/5 ring-4 ring-primary/5' : 'border-slate-50 hover:border-slate-200'}`}
                                    >
                                        <span className="font-bold text-slate-700 capitalize">{rt.name.toLowerCase()}</span>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedRoomType === rt.id ? 'border-primary' : 'border-slate-200'}`}>
                                            {selectedRoomType === rt.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                        </div>
                                    </button>
                                ))}
                                <button 
                                    onClick={() => setSelectedRoomType(null)}
                                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${selectedRoomType === null ? 'border-primary bg-primary/5 ring-4 ring-primary/5' : 'border-slate-50 hover:border-slate-200'}`}
                                >
                                    <span className="font-bold text-slate-700">Standard / Default</span>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedRoomType === null ? 'border-primary' : 'border-slate-200'}`}>
                                        {selectedRoomType === null && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className={`grid gap-4 ${paymentType === "DAILY" ? "grid-cols-2" : "grid-cols-1"}`}>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                {paymentType === "DAILY" ? "Start Date" : (paymentType === "MONTHLY" ? "Start Date" : "Date")}
                            </p>
                            <input 
                                type="date" 
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-sm font-bold text-slate-700"
                                value={checkIn}
                                onChange={(e) => setCheckIn(e.target.value)}
                            />
                        </div>
                        {paymentType === "DAILY" && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">End Date</p>
                                <input 
                                    type="date" 
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-sm font-bold text-slate-700"
                                    value={checkOut}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Select Payment Plan</p>
                    <div className="grid grid-cols-1 gap-3">
                        {property.allows_nightly && (
                            <button 
                                onClick={() => setPaymentType("NIGHTLY")}
                                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${paymentType === "NIGHTLY" ? 'border-primary bg-primary/5 ring-4 ring-primary/5' : 'border-slate-50 hover:border-slate-200'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentType === "NIGHTLY" ? 'border-primary' : 'border-slate-200'}`}>
                                        {paymentType === "NIGHTLY" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                    </div>
                                    <span className="font-bold text-slate-700">Nightly</span>
                                </div>
                                <span className="font-black text-slate-900">${getPriceForType("NIGHTLY")}</span>
                            </button>
                        )}
                        {property.allows_daily && (
                            <button 
                                onClick={() => setPaymentType("DAILY")}
                                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${paymentType === "DAILY" ? 'border-primary bg-primary/5 ring-4 ring-primary/5' : 'border-slate-50 hover:border-slate-200'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentType === "DAILY" ? 'border-primary' : 'border-slate-200'}`}>
                                        {paymentType === "DAILY" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                    </div>
                                    <span className="font-bold text-slate-700">Daily</span>
                                </div>
                                <span className="font-black text-slate-900">${getPriceForType("DAILY")}</span>
                            </button>
                        )}
                        {property.allows_monthly && (
                            <button 
                                onClick={() => setPaymentType("MONTHLY")}
                                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${paymentType === "MONTHLY" ? 'border-primary bg-primary/5 ring-4 ring-primary/5' : 'border-slate-50 hover:border-slate-200'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentType === "MONTHLY" ? 'border-primary' : 'border-slate-200'}`}>
                                        {paymentType === "MONTHLY" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                    </div>
                                    <span className="font-bold text-slate-700">Monthly</span>
                                </div>
                                <span className="font-black text-slate-900">${getPriceForType("MONTHLY")}</span>
                            </button>
                        )}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Advance Due Today</span>
                      <span className="font-black text-slate-900 text-lg">${property.advance_payment_amount}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase">Secure your booking with a fixed advance payment.</p>
                  </div>
                  
                  <button 
                    onClick={handleBookNow}
                    disabled={!property.is_available}
                    className={`w-full font-black py-5 rounded-[20px] transition-all active:scale-[0.98] text-lg flex justify-center items-center gap-3 shadow-xl ${
                        !property.is_available 
                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none' 
                        : 'bg-primary hover:bg-slate-900 text-white shadow-primary/20'
                    }`}
                  >
                    {property.is_available ? (
                        <>
                            <span>Reserve Now</span>
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </>
                    ) : 'Fully Booked'}
                  </button>
                  <p className="text-center text-[10px] font-bold text-slate-400 mt-6 uppercase tracking-widest">Premium Secure Booking</p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
