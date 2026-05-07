"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { API_URL, mediaUrl } from "@/lib/config";

interface Property {
  id: number;
  title: string;
  description: string;
  property_type: string;
  price_per_night: string;
  location: string;
  image: string;
  image_url: string;
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [propertyType, setPropertyType] = useState(searchParams.get("property_type") || "");

  const propertyTypes = [
    { id: "", label: "All Properties" },
    { id: "VILLA", label: "Villas" },
    { id: "PRIVATE_ROOM", label: "Private Rooms" },
    { id: "BEACHFRONT", label: "Beachfront" },
    { id: "CABIN", label: "Cabins" },
    { id: "CASTLE", label: "Castles" },
  ];

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (location) query.append("location", location);
      if (keyword) query.append("keyword", keyword);
      if (propertyType) query.append("property_type", propertyType);

      const res = await fetch(`${API_URL}/api/properties/?${query.toString()}`);
      const data = await res.json();
      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [searchParams]);

  const handleFilterSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = new URLSearchParams();
    if (location) query.append("location", location);
    if (keyword) query.append("keyword", keyword);
    if (propertyType) query.append("property_type", propertyType);
    router.push(`/explore?${query.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        {/* Header Section */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-4">Explore our collection</h1>
          <p className="text-slate-500 font-medium max-w-xl leading-relaxed">
            Discover a curated selection of extraordinary stays, from architectural marvels to hidden coastal gems.
          </p>
        </div>

        {/* Integrated Filter Bar */}
        <div className="mb-16 space-y-8">
            <form onSubmit={handleFilterSubmit} className="flex flex-col md:flex-row gap-4 p-4 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-sm">
                <div className="flex-1 flex items-center gap-4 px-6 py-2 border-r border-slate-200">
                    <span className="material-symbols-outlined text-teal-600 font-bold">location_on</span>
                    <input 
                        type="text" 
                        placeholder="Anywhere" 
                        className="bg-transparent border-none outline-none text-slate-900 font-bold w-full placeholder:text-slate-400"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>
                <div className="flex-1 flex items-center gap-4 px-6 py-2">
                    <span className="material-symbols-outlined text-teal-600 font-bold">search</span>
                    <input 
                        type="text" 
                        placeholder="Search keywords..." 
                        className="bg-transparent border-none outline-none text-slate-900 font-bold w-full placeholder:text-slate-400"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>
                <button 
                    type="submit"
                    className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-teal-600 transition-all active:scale-95"
                >
                    Search Stays
                </button>
            </form>

            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
                {propertyTypes.map((type) => (
                <button
                    key={type.id}
                    onClick={() => {
                        setPropertyType(type.id);
                        const query = new URLSearchParams(searchParams.toString());
                        if (type.id) query.set("property_type", type.id);
                        else query.delete("property_type");
                        router.push(`/explore?${query.toString()}`);
                    }}
                    className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                        propertyType === type.id 
                            ? "bg-slate-900 text-white border-slate-900" 
                            : "bg-white text-slate-400 border-slate-200 hover:border-slate-900 hover:text-slate-900"
                    }`}
                >
                    {type.label}
                </button>
                ))}
            </div>
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-slate-100 rounded-[2rem] mb-6"></div>
                <div className="h-6 bg-slate-100 rounded-full w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-100 rounded-full w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {properties.map((prop) => (
              <Link href={`/properties/${prop.id}`} key={prop.id} className="group block">
                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden relative mb-6 bg-slate-50 border border-slate-100 shadow-sm transition-shadow hover:shadow-xl">
                  <img 
                    src={mediaUrl(prop.image || prop.image_url)} 
                    alt={prop.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm border border-slate-100">
                      {prop.property_type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="px-2">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black tracking-tight text-slate-900 group-hover:text-teal-600 transition-colors">{prop.title}</h3>
                    <div className="flex items-center gap-1 font-black text-slate-900 text-xs">
                        <span className="material-symbols-outlined text-amber-400 text-sm">star</span>
                        4.9
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs font-bold flex items-center gap-1 mb-4 uppercase tracking-widest">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    {prop.location}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">${prop.price_per_night}</span>
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">/ night</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && properties.length === 0 && (
          <div className="py-32 text-center rounded-[3rem] border-2 border-dashed border-slate-100">
            <span className="material-symbols-outlined text-5xl text-slate-200 mb-6 font-thin">search_off</span>
            <h3 className="text-xl font-black text-slate-800">No properties found</h3>
            <p className="text-slate-400 max-w-xs mx-auto mt-2 text-sm font-medium">Try refining your location or keyword to explore more of our collection.</p>
            <button 
                onClick={() => {
                    setLocation("");
                    setKeyword("");
                    setPropertyType("");
                    router.push("/explore");
                }}
                className="mt-10 px-8 py-3 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-teal-600 transition-all shadow-lg active:scale-95"
            >
                Clear all filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
    </div>}>
      <ExploreContent />
    </Suspense>
  );
}
