"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/config";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AddPropertyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    property_type: "VILLA",
    price_per_night: "",
    price_per_day: "",
    price_per_month: "",
    allows_nightly: true,
    allows_daily: false,
    allows_monthly: false,
    location: "",
    image_url: "",
    advance_payment_amount: "50.00",
    amenities: [] as string[],
    room_types: [
      { name: 'DORMITORY', price_per_night: '', price_per_day: '', price_per_month: '', enabled: false },
      { name: 'DOUBLE', price_per_night: '', price_per_day: '', price_per_month: '', enabled: false },
      { name: 'SINGLE', price_per_night: '', price_per_day: '', price_per_month: '', enabled: false },
    ]
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const availableAmenities = [
    { id: 'wifi', label: 'Fast WiFi', icon: 'wifi' },
    { id: 'kitchen', label: 'Kitchen', icon: 'kitchen' },
    { id: 'ac', label: 'Air conditioning', icon: 'ac_unit' },
    { id: 'pool', label: 'Private pool', icon: 'pool' },
    { id: 'parking', label: 'Free parking', icon: 'local_parking' },
    { id: 'gym', label: 'Gym', icon: 'fitness_center' },
    { id: 'tv', label: 'TV', icon: 'tv' },
    { id: 'workspace', label: 'Dedicated workspace', icon: 'laptop_mac' },
  ];

  const handleAmenityToggle = (amenityId: string) => {
    setFormData(prev => {
      const amenities = prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId];
      return { ...prev, amenities };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const enabledRoomTypes = formData.room_types.filter(rt => rt.enabled);
    if (enabledRoomTypes.length === 0) {
        setError("Please enable at least one room type and set its pricing.");
        setLoading(false);
        return;
    }

    const token = localStorage.getItem("access");
    if (!token) {
      setError("You must be logged in to add a property.");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("property_type", formData.property_type);
      
      let basePriceNight = "";
      let basePriceDay = "";
      let basePriceMonth = "";
      
      if (enabledRoomTypes.length > 0) {
        basePriceNight = enabledRoomTypes[0].price_per_night || "";
        basePriceDay = enabledRoomTypes[0].price_per_day || "";
        basePriceMonth = enabledRoomTypes[0].price_per_month || "";
      }
      
      data.append("price_per_night", basePriceNight);
      data.append("allows_nightly", "true");
      data.append("price_per_day", basePriceDay);
      data.append("allows_daily", "true");
      data.append("price_per_month", basePriceMonth);
      data.append("allows_monthly", "true");
      data.append("location", formData.location);
      data.append("advance_payment_amount", formData.advance_payment_amount);
      data.append("amenities", JSON.stringify(formData.amenities));
      
      const roomTypesData = formData.room_types
        .filter(rt => rt.enabled)
        .map(rt => ({
          name: rt.name,
          price_per_night: rt.price_per_night || null,
          price_per_day: rt.price_per_day || null,
          price_per_month: rt.price_per_month || null
        }));
      
      if (roomTypesData.length > 0) {
        data.append("room_types", JSON.stringify(roomTypesData));
      }

      if (formData.image_url) data.append("image_url", formData.image_url);
      imageFiles.forEach(file => {
          data.append("images", file);
      });
      if (imageFiles.length > 0) {
          data.append("image", imageFiles[0]);
      }

      const res = await fetch(`${API_URL}/api/properties/`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: data,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(JSON.stringify(errData));
      }

      router.push("/dashboard/host");
    } catch (err: any) {
      setError("Failed to add property: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter']">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-12 border-b border-slate-50 pb-8">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">List your sanctuary</h1>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Become a LuxeStay Host Partner</p>
            </div>
            <Link href="/dashboard/host" className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all">
              <span className="material-symbols-outlined">close</span>
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl mb-12 border border-red-100 flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            <section className="space-y-8">
                <h2 className="text-sm font-black text-teal-600 uppercase tracking-widest">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Listing Title</label>
                        <input required type="text" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Villa Marandhu" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Estate Category</label>
                        <select required className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all appearance-none" value={formData.property_type} onChange={(e) => setFormData({...formData, property_type: e.target.value})}>
                            <option value="VILLA">Villa</option>
                            <option value="PRIVATE_ROOM">Private Room</option>
                            <option value="BEACHFRONT">Beachfront</option>
                            <option value="CABIN">Cabin</option>
                            <option value="CASTLE">Castle</option>
                            <option value="HOSTEL">Hostel</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Estate Description</label>
                    <textarea required rows={4} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Describe the soul of your property..."></textarea>
                </div>
            </section>

            <section className="space-y-8">
                <h2 className="text-sm font-black text-teal-600 uppercase tracking-widest">Pricing & Room Categories</h2>
                <div className="grid gap-6">
                {formData.room_types.map((rt, index) => (
                    <div key={rt.name} className={`p-8 rounded-[2rem] border-2 transition-all ${rt.enabled ? 'border-teal-600 bg-teal-50/30' : 'border-slate-50 bg-slate-50/50'}`}>
                    <label className="flex items-center gap-4 mb-8 cursor-pointer">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${rt.enabled ? 'border-teal-600 bg-teal-600' : 'border-slate-200'}`}>
                            {rt.enabled && <span className="material-symbols-outlined text-white text-[16px] font-black">check</span>}
                        </div>
                        <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={rt.enabled} 
                            onChange={(e) => {
                                const newRTs = [...formData.room_types];
                                newRTs[index].enabled = e.target.checked;
                                setFormData({...formData, room_types: newRTs});
                            }} 
                        />
                        <span className="font-black text-slate-800 text-lg uppercase tracking-tight">{rt.name}</span>
                    </label>
                    
                    {rt.enabled && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Per Night</label>
                                <input type="number" step="0.01" className="w-full bg-white border-none rounded-xl px-4 py-3 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20" value={rt.price_per_night} onChange={(e) => {
                                    const newRTs = [...formData.room_types];
                                    newRTs[index].price_per_night = e.target.value;
                                    setFormData({...formData, room_types: newRTs});
                                }} placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Per Day</label>
                                <input type="number" step="0.01" className="w-full bg-white border-none rounded-xl px-4 py-3 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20" value={rt.price_per_day} onChange={(e) => {
                                    const newRTs = [...formData.room_types];
                                    newRTs[index].price_per_day = e.target.value;
                                    setFormData({...formData, room_types: newRTs});
                                }} placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Per Month</label>
                                <input type="number" step="0.01" className="w-full bg-white border-none rounded-xl px-4 py-3 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20" value={rt.price_per_month} onChange={(e) => {
                                    const newRTs = [...formData.room_types];
                                    newRTs[index].price_per_month = e.target.value;
                                    setFormData({...formData, room_types: newRTs});
                                }} placeholder="0.00" />
                            </div>
                        </div>
                    )}
                    </div>
                ))}
                </div>
            </section>

            <section className="space-y-8">
                <h2 className="text-sm font-black text-teal-600 uppercase tracking-widest">Location & Logistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Property Location</label>
                        <input required type="text" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="City, Country" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Advance Confirmation Fee ($)</label>
                        <input required type="number" step="0.01" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" value={formData.advance_payment_amount} onChange={(e) => setFormData({...formData, advance_payment_amount: e.target.value})} placeholder="50.00" />
                    </div>
                </div>
            </section>

            <section className="space-y-8">
                <h2 className="text-sm font-black text-teal-600 uppercase tracking-widest">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {availableAmenities.map(amenity => (
                    <button
                    key={amenity.id}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity.id)}
                    className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all gap-3 ${
                        formData.amenities.includes(amenity.id)
                        ? 'border-teal-600 bg-teal-50 text-teal-600'
                        : 'border-slate-50 text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                    >
                    <span className="material-symbols-outlined text-2xl">{amenity.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{amenity.label}</span>
                    </button>
                ))}
                </div>
            </section>

            <section className="space-y-8">
                <h2 className="text-sm font-black text-teal-600 uppercase tracking-widest">Visual Assets</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Upload Photos</label>
                        <input type="file" multiple accept="image/*" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-teal-600 file:text-white hover:file:bg-teal-500" onChange={(e) => {
                            if (e.target.files) setImageFiles(Array.from(e.target.files));
                        }} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Image URL Fallback</label>
                        <input type="url" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
                    </div>
                </div>
            </section>

            <button disabled={loading} type="submit" className="w-full bg-slate-900 hover:bg-teal-600 text-white font-black py-6 rounded-[2rem] transition-all active:scale-[0.98] mt-12 text-sm uppercase tracking-widest shadow-2xl shadow-slate-900/10">
                {loading ? "Creating Sanctuary..." : "Launch Property Listing"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
