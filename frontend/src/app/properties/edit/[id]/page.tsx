"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/config";

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      router.push("/auth");
      return;
    }

    fetch(`${API_URL}/api/properties/${id}/`)
      .then(res => res.json())
      .then(data => {
        // Map room types from backend to frontend format
        const mappedRoomTypes = formData.room_types.map(rt => {
            const found = data.room_types.find((r: any) => r.name === rt.name);
            if (found) {
                return {
                    name: found.name,
                    price_per_night: found.price_per_night || "",
                    price_per_day: found.price_per_day || "",
                    price_per_month: found.price_per_month || "",
                    enabled: true
                };
            }
            return rt;
        });

        setFormData({
          title: data.title,
          description: data.description,
          property_type: data.property_type,
          price_per_night: data.price_per_night || "",
          price_per_day: data.price_per_day || "",
          price_per_month: data.price_per_month || "",
          allows_nightly: data.allows_nightly,
          allows_daily: data.allows_daily,
          allows_monthly: data.allows_monthly,
          location: data.location,
          image_url: data.image_url || "",
          advance_payment_amount: data.advance_payment_amount,
          amenities: Array.isArray(data.amenities) ? data.amenities : [],
          room_types: mappedRoomTypes
        });
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load property details.");
        setLoading(false);
      });
  }, [id, router]);

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
    setSaving(true);
    setError("");

    const enabledRoomTypes = formData.room_types.filter(rt => rt.enabled);
    if (enabledRoomTypes.length === 0) {
        setError("Please enable at least one room type and set its pricing.");
        setSaving(false);
        return;
    }

    const token = localStorage.getItem("access");
    if (!token) {
      setError("You must be logged in to edit a property.");
      setSaving(false);
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
      
      data.append("room_types", JSON.stringify(roomTypesData));

      if (formData.image_url) data.append("image_url", formData.image_url);
      
      // Append multiple images for the gallery
      imageFiles.forEach(file => {
          data.append("images", file);
      });

      // Set the first image as the primary cover image if a new one is uploaded
      if (imageFiles.length > 0) {
          data.append("image", imageFiles[0]);
      }

      const res = await fetch(`${API_URL}/api/properties/${id}/`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: data,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(JSON.stringify(errData));
      }

      router.push("/dashboard/host");
    } catch (err: any) {
      setError("Failed to update property: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;

  return (
    <div className="min-h-screen bg-surface py-12 px-6 font-['Inter']">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
        <div className="flex justify-between items-center mb-8 border-b pb-6">
          <h1 className="text-3xl font-bold text-primary tracking-tight">Edit Property</h1>
          <Link href="/dashboard/host" className="text-slate-500 font-semibold hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">close</span> Cancel
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-100 font-medium flex items-center gap-2">
            <span className="material-symbols-outlined">error</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 tracking-widest uppercase">Title</label>
              <input required type="text" className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Sunset Villa" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 tracking-widest uppercase">Property Type</label>
              <select required className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.property_type} onChange={(e) => setFormData({...formData, property_type: e.target.value})}>
                <option value="HOSTEL">Hostel</option>
                <option value="PRIVATE_ROOM">Private Room</option>
                <option value="VILLA">Villa</option>
                <option value="BEACHFRONT">Beachfront</option>
                <option value="CABIN">Cabin</option>
                <option value="CASTLE">Castle</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <label className="block text-xs font-bold text-slate-500 tracking-widest uppercase">Room Types & Pricing</label>
            <p className="text-[10px] text-slate-400 font-medium uppercase -mt-4">Enable the room categories available at your property and set their prices.</p>
            <div className="space-y-4">
              {formData.room_types.map((rt, index) => (
                <div key={rt.name} className={`p-6 rounded-2xl border-2 transition-all ${rt.enabled ? 'border-teal-600 bg-teal-50/30' : 'border-slate-100'}`}>
                  <label className="flex items-center gap-3 mb-6 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded accent-teal-600" 
                      checked={rt.enabled} 
                      onChange={(e) => {
                        const newRTs = [...formData.room_types];
                        newRTs[index].enabled = e.target.checked;
                        setFormData({...formData, room_types: newRTs});
                      }} 
                    />
                    <span className="font-bold text-slate-800 text-lg capitalize">{rt.name.toLowerCase()}</span>
                  </label>
                  
                  {rt.enabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Price per night</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                          <input 
                            type="number" 
                            step="0.01" 
                            className="w-full border border-slate-200 rounded-lg pl-8 pr-4 py-2 focus:outline-none focus:border-teal-600" 
                            value={rt.price_per_night} 
                            onChange={(e) => {
                              const newRTs = [...formData.room_types];
                              newRTs[index].price_per_night = e.target.value;
                              setFormData({...formData, room_types: newRTs});
                            }} 
                            placeholder="0.00" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Price per day</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                          <input 
                            type="number" 
                            step="0.01" 
                            className="w-full border border-slate-200 rounded-lg pl-8 pr-4 py-2 focus:outline-none focus:border-teal-600" 
                            value={rt.price_per_day} 
                            onChange={(e) => {
                              const newRTs = [...formData.room_types];
                              newRTs[index].price_per_day = e.target.value;
                              setFormData({...formData, room_types: newRTs});
                            }} 
                            placeholder="0.00" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Price per month</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                          <input 
                            type="number" 
                            step="0.01" 
                            className="w-full border border-slate-200 rounded-lg pl-8 pr-4 py-2 focus:outline-none focus:border-teal-600" 
                            value={rt.price_per_month} 
                            onChange={(e) => {
                              const newRTs = [...formData.room_types];
                              newRTs[index].price_per_month = e.target.value;
                              setFormData({...formData, room_types: newRTs});
                            }} 
                            placeholder="0.00" 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 tracking-widest uppercase">Location</label>
              <input required type="text" className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-600/10 focus:border-teal-600 transition-all" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="e.g. Santorini, Greece" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 tracking-widest uppercase">Advance Payment Amount ($)</label>
              <input required type="number" step="0.01" className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-600/10 focus:border-teal-600 transition-all" value={formData.advance_payment_amount} onChange={(e) => setFormData({...formData, advance_payment_amount: e.target.value})} placeholder="50.00" />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-500 tracking-widest uppercase">Amenities</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {availableAmenities.map(amenity => (
                <button
                  key={amenity.id}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${
                    formData.amenities.includes(amenity.id)
                      ? 'border-teal-600 bg-teal-50 text-teal-600'
                      : 'border-slate-50 text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined">{amenity.icon}</span>
                  <span className="text-xs font-bold">{amenity.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 tracking-widest uppercase">Description</label>
            <textarea required rows={4} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-600/10 focus:border-teal-600 transition-all" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Describe your stunning property..."></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 tracking-widest uppercase">Add New Photos</label>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-600/10 focus:border-teal-600 transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-600 hover:file:bg-teal-100" 
                onChange={(e) => {
                  if (e.target.files) {
                      setImageFiles(Array.from(e.target.files));
                  }
                }} 
              />
              <p className="text-[10px] text-slate-400 font-medium italic">Uploading new photos will add to your current gallery.</p>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 tracking-widest uppercase">Update Image URL (Fallback)</label>
              <input type="url" className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-600/10 focus:border-teal-600 transition-all" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
            </div>
          </div>

          <button disabled={saving} type="submit" className="w-full bg-slate-900 hover:bg-teal-600 text-white font-black py-5 rounded-2xl transition-all active:scale-[0.98] mt-8 text-sm uppercase tracking-widest shadow-xl">
            {saving ? (
                <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Processing Sanctuary...</span>
                </div>
            ) : "Update Sanctuary"}
          </button>
        </form>
      </div>
    </div>
  );
}
