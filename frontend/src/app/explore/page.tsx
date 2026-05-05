"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Property {
  id: number;
  title: string;
  description: string;
  property_type: string;
  price_per_night: string;
  location: string;
  image: string | null;
  image_url: string | null;
  host_username: string;
  advance_payment_amount: string;
  is_available: boolean;
  room_types: { name: string }[];
}

export default function ExplorePage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [propertyType, setPropertyType] = useState("ALL");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [roomType, setRoomType] = useState("ALL");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    setIsLoggedIn(!!token);
    setUserRole(localStorage.getItem("role"));
    
    // Parse URL params
    const urlParams = new URLSearchParams(window.location.search);
    const loc = urlParams.get('location');
    const kw = urlParams.get('keyword');
    if (loc) setSearchLocation(loc);
    if (kw) setSearchKeyword(kw);

    fetch("http://localhost:8000/api/properties/")
      .then(res => res.json())
      .then(data => {
        setProperties(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch properties:", err);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
  };

  const filteredProperties = properties.filter(prop => {
    if (searchLocation && !prop.location.toLowerCase().includes(searchLocation.toLowerCase())) {
      return false;
    }
    if (searchKeyword && !prop.title.toLowerCase().includes(searchKeyword.toLowerCase()) && !prop.description.toLowerCase().includes(searchKeyword.toLowerCase())) {
      return false;
    }
    if (propertyType !== "ALL" && prop.property_type !== propertyType) {
      return false;
    }
    if (roomType !== "ALL" && !prop.room_types?.some(rt => rt.name === roomType)) {
      return false;
    }
    if (minPrice && parseFloat(prop.price_per_night) < parseFloat(minPrice)) {
      return false;
    }
    if (maxPrice && parseFloat(prop.price_per_night) > parseFloat(maxPrice)) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-surface text-on-surface min-h-screen font-['Inter']">
      {/* Main Header with Search */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-2xl font-black text-primary tracking-tighter">LuxeStay</Link>
            <Link href="/" className="hidden md:block text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Home</Link>
          </div>
          
          <div className="hidden md:flex items-center bg-white border border-slate-300 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200 p-1 pl-6">
            <div className="flex flex-col border-r border-slate-200 pr-4">
              <span className="text-[10px] font-bold text-slate-800 tracking-wider">Location</span>
              <input 
                type="text" 
                placeholder="Where are you going?" 
                className="outline-none text-sm text-slate-600 w-40 bg-transparent placeholder-slate-400"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>
            <div className="flex flex-col border-r border-slate-200 pr-4 pl-4">
              <span className="text-[10px] font-bold text-slate-800 tracking-wider">Keyword</span>
              <input 
                type="text" 
                placeholder="Search..." 
                className="outline-none text-sm text-slate-600 w-32 bg-transparent placeholder-slate-400"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <button className="bg-primary hover:bg-primary-container text-white w-10 h-10 ml-2 rounded-full flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-lg">search</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {userRole === 'OWNER' && (
                  <Link href="/dashboard/owner" className="hidden lg:block text-sm font-semibold text-slate-600 hover:text-primary px-3 py-2 rounded-full transition-all">Owner Dashboard</Link>
                )}
                {userRole === 'ADMIN' && (
                  <Link href="/dashboard/admin" className="hidden lg:block text-sm font-semibold text-slate-600 hover:text-primary px-3 py-2 rounded-full transition-all">Admin Dashboard</Link>
                )}
                {(userRole === 'OWNER' || userRole === 'ADMIN') && (
                  <Link href="/properties/add" className="text-sm font-semibold text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-full transition-all">List your property</Link>
                )}
                <button onClick={handleLogout} className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Logout</button>
              </>
            ) : (
              <Link href="/auth" className="text-sm font-semibold text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-full transition-all border border-slate-200">Sign In</Link>
            )}
            <div className="flex items-center gap-2 p-1.5 border border-slate-300 rounded-full hover:shadow-md transition-shadow cursor-pointer bg-white">
              <span className="material-symbols-outlined px-1 text-slate-500">menu</span>
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden text-slate-400">
                <span className="material-symbols-outlined">person</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center gap-3 overflow-x-auto hide-scrollbar">
          <button className="flex items-center gap-2 border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium hover:border-slate-800 transition-colors whitespace-nowrap bg-white">
            <span className="material-symbols-outlined text-[18px]">tune</span> Filters
          </button>
          <div className="h-6 w-px bg-slate-300 mx-1"></div>
          <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-2 py-1 bg-white">
            <span className="text-sm font-medium text-slate-600 pl-2">Min $</span>
            <input 
              type="number" 
              className="w-16 outline-none text-sm" 
              value={minPrice} 
              onChange={e => setMinPrice(e.target.value)} 
              placeholder="0"
            />
            <span className="text-sm font-medium text-slate-600">- Max $</span>
            <input 
              type="number" 
              className="w-16 outline-none text-sm" 
              value={maxPrice} 
              onChange={e => setMaxPrice(e.target.value)} 
              placeholder="Any"
            />
          </div>
          <select 
            className="border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium hover:border-slate-800 transition-colors bg-white outline-none"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="HOSTEL">Hostel</option>
            <option value="PRIVATE_ROOM">Private Room</option>
            <option value="VILLA">Villa</option>
            <option value="BEACHFRONT">Beachfront</option>
            <option value="CABIN">Cabin</option>
            <option value="CASTLE">Castle</option>
          </select>
          <select 
            className="border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium hover:border-slate-800 transition-colors bg-white outline-none"
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
          >
            <option value="ALL">All Rooms</option>
            <option value="DORMITORY">Dormitory</option>
            <option value="DOUBLE">Double</option>
            <option value="SINGLE">Single</option>
          </select>
          <button className="flex items-center gap-2 border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium hover:border-slate-800 transition-colors whitespace-nowrap bg-white">
            Amenities <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </button>
          <button className="flex items-center gap-2 border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium hover:border-slate-800 transition-colors whitespace-nowrap bg-white ml-auto">
            <span className="material-symbols-outlined text-[18px] text-teal-600">bolt</span> Instant Book
          </button>
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            {searchLocation ? `Stays in ${searchLocation}` : `Over ${properties.length > 300 ? '300' : properties.length} stays available`}
          </h1>
          <p className="text-slate-500 mt-1">Explore curated premium properties and luxury apartments.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-300 rounded-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-2">No properties found</h3>
            <p className="text-slate-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((prop) => (
              <div 
                key={prop.id} 
                className="group cursor-pointer flex flex-col"
                onClick={() => router.push(`/properties/${prop.id}`)}
              >
                <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 relative bg-slate-200 flex items-center justify-center">
                  {(prop.image || prop.image_url) ? (
                    <img 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt={prop.title} 
                      src={prop.image || prop.image_url!} 
                    />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-slate-400">image_not_supported</span>
                  )}
                  {!prop.is_available && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 backdrop-blur-[2px]">
                        <span className="bg-white/90 text-slate-900 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">Not Available</span>
                    </div>
                  )}
                  <button className="absolute top-3 right-3 text-white drop-shadow-md hover:scale-110 transition-transform z-20" onClick={(e) => { e.stopPropagation(); /* toggle favorite */ }}>
                    <span className="material-symbols-outlined text-3xl font-light">favorite</span>
                  </button>
                </div>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-slate-900 truncate pr-4">{prop.title}</h3>
                  <div className="flex items-center gap-1 text-sm font-medium text-slate-900 shrink-0">
                    <span className="material-symbols-outlined text-sm text-yellow-500">star</span>
                    {(Math.random() * (5 - 4.5) + 4.5).toFixed(2)}
                  </div>
                </div>
                <p className="text-slate-500 text-sm">{prop.location}</p>
                <p className="text-slate-500 text-sm mb-1">{prop.property_type.replace('_', ' ')}</p>
                <p className="text-slate-900 font-semibold mt-1">
                  ${prop.price_per_night} <span className="font-normal text-slate-500 text-sm">/ night</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
