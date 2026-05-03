import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Bell, 
  ChevronDown, 
  Command
} from 'lucide-react';

export default function TopBar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200 z-50 flex items-center justify-between px-6 transition-all duration-300">
      {/* Left Zone: Logo & Entity Switcher */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 bg-brand-emerald rounded-lg flex items-center justify-center shadow-lg shadow-brand-emerald/20 group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-xl leading-none">H</span>
          </div>
          <span className="text-slate-900 font-semibold text-lg tracking-tight hidden md:block">Haypbooks</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-brand-emerald/20 rounded-full cursor-pointer hover:bg-slate-200 transition-colors group">
          <div className="w-2 h-2 bg-brand-emerald rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          <span className="text-slate-700 text-sm font-medium">Tech Corp USA</span>
          <ChevronDown size={14} className="text-slate-400 group-hover:text-brand-emerald transition-colors" />
        </div>
      </div>

      {/* Center Zone: Global Search */}
      <div className="flex-1 max-w-2xl px-8">
        <div className={`relative flex items-center transition-all duration-300 ${isSearchFocused ? 'scale-[1.02]' : ''}`}>
          <Search 
            size={18} 
            className={`absolute left-4 transition-colors ${isSearchFocused ? 'text-brand-emerald' : 'text-slate-400'}`} 
          />
          <input
            type="text"
            placeholder="Search customers, invoices..."
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`w-full bg-slate-100 border-2 py-2 pl-12 pr-16 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all duration-300 ${
              isSearchFocused ? 'border-brand-emerald bg-white shadow-[0_8px_30px_rgba(16,185,129,0.08)]' : 'border-transparent'
            }`}
          />
          <div className="absolute right-4 flex items-center gap-1 px-1.5 py-0.5 bg-slate-200 border border-slate-300 rounded text-[10px] font-bold text-slate-500">
            <Command size={10} />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Zone: Actions */}
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 bg-brand-emerald rounded-full flex items-center justify-center text-white shadow-lg shadow-brand-emerald/40 hover:scale-110 active:scale-95 transition-all group">
          <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
        
        <button className="relative p-2 text-slate-400 hover:text-slate-900 transition-colors group">
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-emerald rounded-full border-2 border-white" />
          <div className="absolute inset-0 bg-brand-emerald/0 group-hover:bg-brand-emerald/5 rounded-full transition-all" />
        </button>

        <div className="relative cursor-pointer group">
          <div className="w-10 h-10 rounded-full border-2 border-brand-emerald/30 p-0.5 transition-all group-hover:border-brand-emerald">
            <img 
              src="https://picsum.photos/seed/avatar/100/100" 
              alt="User" 
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-brand-emerald border-2 border-white rounded-full" />
        </div>
      </div>
    </header>
  );
}
