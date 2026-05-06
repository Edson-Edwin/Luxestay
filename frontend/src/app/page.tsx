"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL, mediaUrl } from "@/lib/config";

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
}

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchDates, setSearchDates] = useState("");
  const [searchGuests, setSearchGuests] = useState("");

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    setIsLoggedIn(!!token);
    setUserRole(localStorage.getItem("role"));

    fetch(`${API_URL}/api/properties/`)
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
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUserRole(null);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* TopNavBar */}
      <header className="bg-white/95 backdrop-blur-md text-primary font-['Inter'] antialiased tracking-tight full-width top-0 z-50 border-b border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.05)] sticky">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 flex justify-between items-center h-20">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-black text-primary tracking-tighter">LuxeStay</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-primary font-semibold border-b-2 border-primary pb-1" href="/">Home</Link>
            <Link className="text-slate-500 font-medium hover:bg-slate-50 transition-all duration-200 ease-in-out px-2 py-1 rounded" href="/explore">Explore</Link>
          </nav>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {userRole === 'HOST' && (
                  <Link href="/dashboard/host" className="hidden lg:block text-sm font-semibold text-slate-600 hover:text-primary px-3 py-2 rounded-full transition-all">Host Dashboard</Link>
                )}
                {userRole === 'ADMIN' && (
                  <Link href="/dashboard/admin" className="hidden lg:block text-sm font-semibold text-slate-600 hover:text-primary px-3 py-2 rounded-full transition-all">Admin Dashboard</Link>
                )}
                {(userRole === 'HOST' || userRole === 'ADMIN') && (
                  <Link href="/properties/add" className="hidden lg:block text-sm font-semibold bg-primary text-white hover:bg-primary-container px-5 py-2.5 rounded-full transition-all">Add Property</Link>
                )}
                <button onClick={handleLogout} className="text-sm font-semibold text-secondary hover:text-primary transition-colors">Logout</button>
              </>
            ) : (
              <Link href="/auth" className="text-sm font-semibold text-primary hover:bg-slate-50 px-4 py-2 rounded-full transition-all border border-outline-variant">Sign In</Link>
            )}
            <Link href="/profile" className="flex items-center gap-2 p-2 border border-outline-variant rounded-full hover:shadow-md transition-shadow cursor-pointer">
              <span className="material-symbols-outlined px-1">menu</span>
              <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-500">person</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative h-[640px] flex items-center justify-center px-6">
          <div className="absolute inset-0 z-0">
            <img className="w-full h-full object-cover" alt="Luxury villa" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmI6S5lySA8tpJZOPNmCDrOMoFTzGgP5XMUutdSj4UGAdkvyxvOUqpwi4Ur7IUsYSZ5K-Z0deLelKTd5NI3yffvvrmIrYGgNQ_8JIqiWguWCPsZE2qUlF_tRoLZuKK_5OmBl-NepyeKEuLL_qQgEMfjU7AZI-m0GgpuW4hsLFBEI_ltX8ZWkqstu_pNsFuyty8KJ8BiFL246ORFedjIEPpkpNJZwIduaaj2u9ddBZe36SW0mJoaYixmMK5-JNPiKiUqla41okUjPk" />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          <div className="relative z-10 w-full max-w-4xl mt-12">
            <div className="text-center mb-10 text-white drop-shadow-lg">
              <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight drop-shadow-2xl">Find your next luxury retreat</h1>
              <p className="text-xl md:text-2xl font-medium opacity-90 drop-shadow-md">Curated premium stays for the discerning traveler.</p>
            </div>
            {/* Search Bar */}
            <div className="bg-white p-4 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center gap-2 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-200 transform hover:scale-[1.01] transition-transform duration-300">
              <div className="flex-[2] w-full px-6 py-2">
                <label className="block text-xs font-bold tracking-widest text-secondary mb-1">PLACE</label>
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Where are you going?"
                  className="w-full bg-transparent focus:outline-none text-lg text-on-surface placeholder:text-slate-400"
                />
              </div>
              <div className="flex-[3] w-full px-6 py-2">
                <label className="block text-xs font-bold tracking-widest text-secondary mb-1">KEYWORD</label>
                <input
                  type="text"
                  value={searchDates}
                  onChange={(e) => setSearchDates(e.target.value)}
                  placeholder="Search for hostels, villas, etc."
                  className="w-full bg-transparent focus:outline-none text-lg text-on-surface placeholder:text-slate-400"
                />
              </div>
              <button
                onClick={() => router.push(`/explore?location=${encodeURIComponent(searchLocation)}&keyword=${encodeURIComponent(searchDates)}`)}
                className="bg-primary hover:bg-primary-container text-white rounded-full w-14 h-14 flex items-center justify-center m-2 shadow-lg transition-all duration-200 active:scale-95"
              >
                <span className="material-symbols-outlined text-3xl">search</span>
              </button>
            </div>
          </div>
        </section>

        {/* Category Pills */}
        <section className="border-b border-outline-variant bg-surface-container-lowest sticky top-20 z-40">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-4 flex items-center gap-8 overflow-x-auto hide-scrollbar border-b border-outline-variant">
            {[
              { icon: 'apartment', label: 'ALL', backendVal: 'ALL' },
              { icon: 'apartment', label: 'HOSTELS', backendVal: 'HOSTEL' },
              { icon: 'bed', label: 'PRIVATE ROOMS', backendVal: 'PRIVATE_ROOM' },
              { icon: 'villa', label: 'VILLAS', backendVal: 'VILLA' },
              { icon: 'beach_access', label: 'BEACHFRONT', backendVal: 'BEACHFRONT' },
              { icon: 'forest', label: 'CABINS', backendVal: 'CABIN' },
              { icon: 'castle', label: 'CASTLES', backendVal: 'CASTLE' },
              { icon: 'pool', label: 'AMAZING POOLS', backendVal: 'POOL' },
            ].map((cat) => (
              <button 
                key={cat.label} 
                onClick={() => setActiveCategory(cat.backendVal)}
                className={`flex flex-col items-center gap-2 min-w-fit transition-colors pb-2 ${activeCategory === cat.backendVal ? 'text-primary border-b-2 border-primary' : 'text-secondary hover:text-primary'}`}
              >
                <span className="material-symbols-outlined">{cat.icon}</span>
                <span className="text-xs font-bold tracking-widest">{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Dynamic Properties from Database */}
        <section className="max-w-[1280px] mx-auto px-6 lg:px-12 py-16">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-on-surface">Live anywhere</h2>
              <p className="text-secondary mt-2 text-lg">Real properties added by our hosts.</p>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : properties.filter(p => activeCategory === 'ALL' || p.property_type === activeCategory).length === 0 ? (
            <div className="bg-surface-container-low rounded-3xl p-16 text-center border border-dashed border-outline-variant">
              <span className="material-symbols-outlined text-6xl text-secondary mb-4">home_work</span>
              <h3 className="text-2xl font-bold text-on-surface mb-2">No properties found</h3>
              <p className="text-secondary mb-6">Be the first to list your amazing space on LuxeStay.</p>
              {(userRole === 'HOST' || userRole === 'ADMIN') ? (
                <Link href="/properties/add" className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primary-container transition-all">List Your Property</Link>
              ) : isLoggedIn ? (
                <Link href="/explore" className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primary-container transition-all">Explore Properties</Link>
              ) : (
                <Link href="/auth" className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primary-container transition-all">Sign In to Host</Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {properties.filter(p => activeCategory === 'ALL' || p.property_type === activeCategory).map((prop) => (
                <div key={prop.id} onClick={() => router.push(`/properties/${prop.id}`)} className="group cursor-pointer flex flex-col h-full">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4 shadow-md relative bg-slate-200 flex items-center justify-center">
                    {(prop.image || prop.image_url) ? (
                      <img 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt={prop.title} 
                        src={mediaUrl(prop.image) || mediaUrl(prop.image_url)} 
                      />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-slate-400">image_not_supported</span>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                      {prop.property_type.replace("_", " ")}
                    </div>
                  </div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-bold text-on-surface truncate pr-2">{prop.title}</h3>
                    <div className="flex items-center gap-1 text-sm font-bold text-on-surface shrink-0">
                      <span className="material-symbols-outlined text-sm text-yellow-500">star</span>
                      4.9
                    </div>
                  </div>
                  <p className="text-secondary text-sm mb-2">{prop.location}</p>
                  <p className="text-on-surface font-bold mt-auto">${prop.price_per_night} <span className="font-normal text-secondary text-sm">night</span></p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
