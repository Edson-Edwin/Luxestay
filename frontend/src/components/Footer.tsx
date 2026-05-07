import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-24 pb-12 px-6 overflow-hidden relative">
      {/* Decorative Gradient Overlay */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white">
                <span className="material-symbols-outlined font-bold">villa</span>
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">LuxeStay</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Defining the new standard of luxury rentals. Curated properties, exceptional service, and unforgettable experiences.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-lg tracking-tight">Explore</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><Link href="/explore" className="hover:text-teal-400 transition-colors">Villas & Estates</Link></li>
              <li><Link href="/explore" className="hover:text-teal-400 transition-colors">Beachfront Stays</Link></li>
              <li><Link href="/explore" className="hover:text-teal-400 transition-colors">Private Cabins</Link></li>
              <li><Link href="/explore" className="hover:text-teal-400 transition-colors">City Lofts</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-lg tracking-tight">Contact Us</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-teal-500 text-lg">mail</span>
                hello@luxestay.living
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-teal-500 text-lg">call</span>
                +1 (555) 000- luxury
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-teal-500 text-lg">location_on</span>
                Beverly Hills, CA 90210
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-lg tracking-tight">Newsletter</h4>
            <p className="text-slate-400 text-sm mb-4">Get curated luxury stay invitations.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm flex-1 focus:outline-none focus:border-teal-500 transition-all"
              />
              <button className="bg-teal-600 hover:bg-teal-500 px-4 py-3 rounded-xl transition-all">
                <span className="material-symbols-outlined text-white">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs">© 2026 LuxeStay International. All rights reserved.</p>
          <div className="flex gap-8 text-slate-500 text-xs">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Cookies Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
